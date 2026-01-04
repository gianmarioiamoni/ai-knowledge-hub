-- Migration: Clean up organizations accidentally created for Super Admin users
-- This removes organizations where the only member is a Super Admin user

-- Function to get Super Admin user IDs from auth.users metadata
CREATE OR REPLACE FUNCTION get_superadmin_user_ids()
RETURNS TABLE(user_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id
  FROM auth.users au
  WHERE (au.raw_user_meta_data->>'role') = 'SUPER_ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove Super Admin users from organization_members
DELETE FROM organization_members
WHERE user_id IN (SELECT user_id FROM get_superadmin_user_ids());

-- Remove organizations that now have no members
DELETE FROM organizations
WHERE id NOT IN (
  SELECT DISTINCT organization_id 
  FROM organization_members
);

-- Drop the temporary function
DROP FUNCTION IF EXISTS get_superadmin_user_ids();

-- Add comment
COMMENT ON TABLE organization_members IS 'Super Admin users should never be members of any organization';

