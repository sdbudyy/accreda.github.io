-- Migration: Set SECURITY INVOKER on sao_annotations_with_metadata view for improved security

DROP VIEW IF EXISTS sao_annotations_with_metadata;

CREATE VIEW sao_annotations_with_metadata
SECURITY INVOKER
AS
SELECT 
    a.*,
    COUNT(r.id) as actual_reply_count,
    calculate_word_count(a.annotation) as calculated_word_count
FROM sao_annotation a
LEFT JOIN sao_annotation_replies r ON a.id = r.annotation_id
GROUP BY a.id; 