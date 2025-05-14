-- Drop existing function if it exists
DROP FUNCTION IF EXISTS search_all;

-- Create search_all function
CREATE OR REPLACE FUNCTION search_all(search_query TEXT, user_id UUID)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    description TEXT,
    category TEXT,
    company TEXT,
    location TEXT,
    email TEXT,
    reference_number INTEGER,
    skill_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Search in documents (using description)
    SELECT 
        d.id::UUID,
        'document'::TEXT as type,
        d.title,
        d.description,
        d.category,
        NULL::TEXT as company,
        NULL::TEXT as location,
        NULL::TEXT as email,
        NULL::INTEGER as reference_number,
        NULL::TEXT as skill_name
    FROM documents d
    WHERE d.user_id = search_all.user_id
    AND (
        d.title ILIKE '%' || search_query || '%'
        OR d.description ILIKE '%' || search_query || '%'
    )

    UNION ALL

    -- Search in SAOs
    SELECT 
        s.id::UUID,
        'sao'::TEXT as type,
        s.title,
        s.content as description,
        NULL::TEXT as category,
        NULL::TEXT as company,
        NULL::TEXT as location,
        NULL::TEXT as email,
        NULL::INTEGER as reference_number,
        NULL::TEXT as skill_name
    FROM saos s
    WHERE s.user_id = search_all.user_id
    AND (
        s.title ILIKE '%' || search_query || '%'
        OR s.content ILIKE '%' || search_query || '%'
    )

    UNION ALL

    -- Search in skills
    SELECT 
        s.id::UUID,
        'skill'::TEXT as type,
        s.name as title,
        NULL::TEXT as description,
        s.category,
        NULL::TEXT as company,
        NULL::TEXT as location,
        NULL::TEXT as email,
        NULL::INTEGER as reference_number,
        NULL::TEXT as skill_name
    FROM skills s
    WHERE s.user_id = search_all.user_id
    AND s.name ILIKE '%' || search_query || '%'

    UNION ALL

    -- Search in jobs
    SELECT 
        j.id::UUID,
        'job'::TEXT as type,
        j.title,
        j.description,
        NULL::TEXT as category,
        j.company,
        j.location,
        NULL::TEXT as email,
        NULL::INTEGER as reference_number,
        NULL::TEXT as skill_name
    FROM jobs j
    WHERE j.user_id = search_all.user_id
    AND (
        j.title ILIKE '%' || search_query || '%'
        OR j.company ILIKE '%' || search_query || '%'
        OR j.location ILIKE '%' || search_query || '%'
        OR j.description ILIKE '%' || search_query || '%'
    )

    UNION ALL

    -- Search in job references
    SELECT 
        r.id::UUID,
        'reference'::TEXT as type,
        r.full_name as title,
        r.description,
        NULL::TEXT as category,
        NULL::TEXT as company,
        NULL::TEXT as location,
        r.email,
        r.reference_number,
        NULL::TEXT as skill_name
    FROM job_references r
    WHERE r.user_id = search_all.user_id
    AND (
        r.full_name ILIKE '%' || search_query || '%'
        OR r.email ILIKE '%' || search_query || '%'
        OR r.description ILIKE '%' || search_query || '%'
    )

    UNION ALL

    -- Search in validators
    SELECT 
        v.id::UUID,
        'validator'::TEXT as type,
        v.full_name as title,
        v.description,
        NULL::TEXT as category,
        NULL::TEXT as company,
        NULL::TEXT as location,
        v.email,
        NULL::INTEGER as reference_number,
        s.name as skill_name
    FROM validators v
    JOIN skills s ON v.skill_id = s.id
    WHERE v.user_id = search_all.user_id
    AND (
        v.full_name ILIKE '%' || search_query || '%'
        OR v.email ILIKE '%' || search_query || '%'
        OR v.description ILIKE '%' || search_query || '%'
        OR s.name ILIKE '%' || search_query || '%'
    );
END;
$$ LANGUAGE plpgsql; 