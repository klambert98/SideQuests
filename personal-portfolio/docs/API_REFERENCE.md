# API Documentation

Complete API reference for Personal Portfolio backend.

## Base URL

```
Development: http://localhost:3001/api
Production: https://yourdomain.com/api
```

## Authentication

All endpoints requiring authentication use Bearer tokens in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are JSON:

```json
{
  "data": {},
  "error": null
}
```

Or on error:

```json
{
  "error": "Error message"
}
```

---

## Authentication Endpoints

### Login

Create a new session.

```
POST /auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "your@email.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "your@email.com",
    "name": "Your Name",
    "avatar": "url",
    "bio": "Your bio"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Current User

```
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "your@email.com",
  "name": "Your Name",
  "avatar": "url",
  "bio": "Your bio"
}
```

### Update User Profile

```
PUT /auth/me
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Name",
  "bio": "New bio",
  "avatar": "new-avatar-url"
}
```

**Response:** Updated user object

### Logout

```
POST /auth/logout
Authorization: Bearer <token>
```

---

## Entry Endpoints

### Get All Entries

Get paginated list of published entries.

```
GET /entries?page=1&limit=10&status=published
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Entries per page (default: 10)
- `status` - Filter by status: draft, published, archived (default: published)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "My Entry",
      "content": "Entry content...",
      "slug": "my-entry",
      "status": "published",
      "entryDate": "2026-01-04",
      "summary": "Brief summary",
      "tags": ["travel", "photography"],
      "views": 42,
      "media": [],
      "embeds": [],
      "createdAt": "2026-01-04T12:00:00Z",
      "updatedAt": "2026-01-04T12:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

### Get Timeline

Get entries organized by year and month.

```
GET /entries/timeline
```

**Response:**
```json
{
  "2026": {
    "01": [
      {
        "id": "uuid",
        "title": "Entry 1",
        ...
      }
    ],
    "02": [...]
  },
  "2025": {...}
}
```

### Get Entries by Month

Get all entries for a specific month.

```
GET /entries/month/:year/:month
```

**Parameters:**
- `year` - Year (e.g., 2026)
- `month` - Month (1-12)

**Response:** Array of entries

### Get Single Entry

```
GET /entries/:id
```

**Response:** Single entry object with incremented view count

### Create Entry

```
POST /entries
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "My New Entry",
  "content": "Content here...",
  "entryDate": "2026-01-04",
  "status": "published",
  "summary": "Brief summary",
  "tags": ["tag1", "tag2"]
}
```

**Response:** Created entry object

### Update Entry

```
PUT /entries/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:** Partial entry object with fields to update

**Response:** Updated entry object

### Delete Entry

```
DELETE /entries/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Entry deleted"
}
```

### Search Entries

```
GET /entries/search/:query
```

**Parameters:**
- `query` - Search query (searches title and content)

**Response:** Array of matching entries

---

## Media Endpoints

### Upload Media

```
POST /media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - File to upload (required)
- `entryId` - Entry ID to attach to (optional)

**Response:**
```json
{
  "id": "uuid",
  "filename": "filename.jpg",
  "originalName": "My Photo.jpg",
  "mimetype": "image/jpeg",
  "type": "image",
  "size": 2048000,
  "url": "/uploads/filename.jpg",
  "thumbnailUrl": "/uploads/thumb-filename.jpg",
  "width": 1920,
  "height": 1080,
  "createdAt": "2026-01-04T12:00:00Z"
}
```

### Get Media for Entry

```
GET /media/entry/:entryId
```

**Response:** Array of media objects

### Delete Media

```
DELETE /media/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Media deleted"
}
```

---

## Embed Endpoints

### Create Embed

```
POST /embeds
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "type": "youtube",
  "entryId": "uuid"
}
```

**Supported Types:**
- `youtube` - YouTube videos
- `instagram` - Instagram posts
- `twitter` - Twitter/X posts
- `tiktok` - TikTok videos
- `vimeo` - Vimeo videos
- `spotify` - Spotify tracks
- `custom` - Custom links

**Response:**
```json
{
  "id": "uuid",
  "type": "youtube",
  "url": "https://youtube.com/...",
  "embedCode": "<iframe>...</iframe>",
  "thumbnail": "https://img.youtube.com/...",
  "title": "Video Title",
  "description": "Video description",
  "metadata": {},
  "entryId": "uuid",
  "createdAt": "2026-01-04T12:00:00Z"
}
```

### Delete Embed

```
DELETE /embeds/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Embed deleted"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized

```json
{
  "error": "No token provided"
}
```

```json
{
  "error": "Invalid token"
}
```

### 404 Not Found

```json
{
  "error": "Entry not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

No rate limiting currently enforced. Consider implementing for production.

## File Upload Limits

- **Max File Size**: 50MB
- **Allowed Types**: jpg, jpeg, png, gif, mp4, mov, webm, pdf, doc, docx

## Rate Limiting (Future)

To be implemented:
- 100 requests per minute per IP
- 10 uploads per hour per user
- 1000 entries per user

## Webhooks (Future)

Planned webhooks:
- `entry.created`
- `entry.updated`
- `entry.deleted`
- `media.uploaded`

## Version History

### v1.0.0 (2026-01-04)
- Initial release
- Basic CRUD operations
- Media upload support
- Embed support
- Timeline view
