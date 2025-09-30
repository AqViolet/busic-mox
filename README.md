Upload Page
- Tabbed UI: "New Album" | "Existing Album"
- Simple required-field validation (no empty fields)
- Submits FormData to:
    POST /api/albums   -> for creating new albums (image + metadata)
    POST /api/songs    -> for uploading a song to an existing album


Notes:
- The page expects two API endpoints to exist (server-side):
    GET  /api/albums   -> returns list of existing albums
    POST /api/albums   -> accept multipart form (image + name + artist)
    POST /api/songs    -> accept multipart form (song file + albumId + optional metadata)
- Files are sent as FormData (so server-side route should read multipart).
- Local storage (uploads/) and DB updates should be implemented server-side in those routes.


Fixes required:
Allow preview album in /upload
Implement a fronted check for duplicate albums, artists or songs
Reset a the page after upload form submission
change the font to inconsolata