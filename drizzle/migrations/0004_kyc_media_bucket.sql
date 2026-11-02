-- The app uploads ID photos and selfies to the "kyc-media" bucket, but no earlier migration created it,
-- so every submission failed with "Could not store your documents". Create it as a PRIVATE bucket
-- restricted to images of a sane size. Only the server (service role) writes; admins read via signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kyc-media', 'kyc-media', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Admin read policy (idempotent re-create of the one from 0000).
drop policy if exists "Admins read kyc media" on storage.objects;
create policy "Admins read kyc media" on storage.objects
  for select to authenticated
  using (bucket_id = 'kyc-media' and public.has_role(auth.uid(), 'admin'));

-- Make the intent explicit: browsers can never write to or delete evidence.
revoke insert, update, delete on public.audit_log from authenticated, anon;
revoke all on public.verifications from anon;
revoke all on public.audit_log from anon;
revoke all on public.user_roles from anon;
