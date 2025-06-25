-- Improve SAO annotation system performance and functionality

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sao_annotation_sao_id_section 
ON sao_annotation(sao_id, status);

CREATE INDEX IF NOT EXISTS idx_sao_annotation_created_by 
ON sao_annotation(created_by);

CREATE INDEX IF NOT EXISTS idx_sao_annotation_resolved 
ON sao_annotation(resolved) WHERE resolved = false;

-- Add indexes for replies
CREATE INDEX IF NOT EXISTS idx_sao_annotation_replies_annotation_id 
ON sao_annotation_replies(annotation_id);

-- Add full-text search capability for annotations
ALTER TABLE sao_annotation 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (to_tsvector('english', annotation)) STORED;

CREATE INDEX IF NOT EXISTS idx_sao_annotation_search 
ON sao_annotation USING GIN(search_vector);

-- Add notification tracking for annotations
ALTER TABLE sao_annotation 
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Create a function to update notification status
CREATE OR REPLACE FUNCTION mark_annotation_notification_sent()
RETURNS TRIGGER AS $$
BEGIN
    NEW.notification_sent = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification tracking
DROP TRIGGER IF EXISTS trigger_mark_annotation_notification_sent ON sao_annotation;
CREATE TRIGGER trigger_mark_annotation_notification_sent
    BEFORE UPDATE ON sao_annotation
    FOR EACH ROW
    EXECUTE FUNCTION mark_annotation_notification_sent();

-- Add metadata for better tracking
ALTER TABLE sao_annotation 
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- Create function to update reply count
CREATE OR REPLACE FUNCTION update_annotation_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE sao_annotation 
        SET reply_count = reply_count + 1 
        WHERE id = NEW.annotation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE sao_annotation 
        SET reply_count = reply_count - 1 
        WHERE id = OLD.annotation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reply count updates
DROP TRIGGER IF EXISTS trigger_update_annotation_reply_count ON sao_annotation_replies;
CREATE TRIGGER trigger_update_annotation_reply_count
    AFTER INSERT OR DELETE ON sao_annotation_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_annotation_reply_count();

-- Add word count calculation
CREATE OR REPLACE FUNCTION calculate_word_count(text_content TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN array_length(regexp_split_to_array(trim(text_content), '\s+'), 1);
END;
$$ LANGUAGE plpgsql;

-- Update existing annotations with word count
UPDATE sao_annotation 
SET word_count = calculate_word_count(annotation)
WHERE word_count = 0;

-- Create a view for better annotation queries
CREATE OR REPLACE VIEW sao_annotations_with_metadata AS
SELECT 
    a.*,
    COUNT(r.id) as actual_reply_count,
    calculate_word_count(a.annotation) as calculated_word_count
FROM sao_annotation a
LEFT JOIN sao_annotation_replies r ON a.id = r.annotation_id
GROUP BY a.id;

-- Add RLS policies for better security
DROP POLICY IF EXISTS "Users can view annotations on their SAOs" ON sao_annotation;
CREATE POLICY "Users can view annotations on their SAOs"
    ON sao_annotation FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM saos
            WHERE saos.id = sao_annotation.sao_id
            AND (
                saos.eit_id = auth.uid() OR 
                sao_annotation.created_by = auth.uid()
            )
        )
    );

-- Add policy for supervisors to view all annotations on SAOs they supervise
CREATE POLICY "Supervisors can view annotations on supervised SAOs"
    ON sao_annotation FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sao_feedback
            WHERE sao_feedback.sao_id = sao_annotation.sao_id
            AND sao_feedback.supervisor_id = auth.uid()
        )
    );

-- Create function to get annotation statistics
CREATE OR REPLACE FUNCTION get_sao_annotation_stats(sao_id_param UUID)
RETURNS TABLE(
    total_annotations INTEGER,
    resolved_annotations INTEGER,
    pending_annotations INTEGER,
    total_replies INTEGER,
    supervisor_annotations INTEGER,
    eit_annotations INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_annotations,
        COUNT(*) FILTER (WHERE resolved = true)::INTEGER as resolved_annotations,
        COUNT(*) FILTER (WHERE resolved = false)::INTEGER as pending_annotations,
        COALESCE(SUM(reply_count), 0)::INTEGER as total_replies,
        COUNT(*) FILTER (WHERE author_role = 'supervisor')::INTEGER as supervisor_annotations,
        COUNT(*) FILTER (WHERE author_role = 'eit')::INTEGER as eit_annotations
    FROM sao_annotation
    WHERE sao_id = sao_id_param;
END;
$$ LANGUAGE plpgsql; 