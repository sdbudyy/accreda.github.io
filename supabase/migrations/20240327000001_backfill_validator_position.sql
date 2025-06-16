-- First, let's check the data in both tables
SELECT v.email as validator_email, v.position as validator_position, 
       sp.email as supervisor_email, sp.position as supervisor_position
FROM validators v
LEFT JOIN supervisor_profiles sp ON v.email = sp.email
WHERE sp.position IS NOT NULL;

-- Then perform the update
UPDATE validators v
SET position = sp.position
FROM supervisor_profiles sp
WHERE v.email = sp.email
AND sp.position IS NOT NULL; 