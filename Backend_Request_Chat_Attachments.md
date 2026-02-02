# Chat Attachment API - Optimization Request

**From:** Frontend Team  
**To:** Backend Team  
**Date:** February 2, 2026

---

## Summary

We've identified a performance bottleneck in the chat messages API related to file attachments.

## Current Situation

When fetching messages, attachments return only a `fileId` reference:

```json
{
  "attachments": [{ "fileId": "6980d88f2de85edc2e90cd19" }]
}
```

To display the file (image preview, filename, download link), the frontend currently needs to make a separate call to `GET /api/v1/uploads/{fileId}` for each attachment.

---

## Impact

### API Call Volume

| Scenario                         | Current Calls | With Populated Data |
| -------------------------------- | ------------- | ------------------- |
| 50 messages, 5 file attachments  | 6 calls       | 1 call              |
| 50 messages, 20 file attachments | 21 calls      | 1 call              |

### User Experience

- **Slower load times** - Messages appear but images/files load progressively as each file is fetched
- **Loading states** - Users see skeleton placeholders while waiting for file details
- **Increased latency** - Each file requires a full round-trip to resolve

---

## What We Need

For each attachment, the frontend needs these fields to render properly:

| Field          | Purpose                                                         |
| -------------- | --------------------------------------------------------------- |
| `url`          | Display image or download link                                  |
| `mimeType`     | Determine if image (render inline) or file (show download card) |
| `originalName` | Display filename to user                                        |
| `size`         | Show file size in download card                                 |

---

## Suggested Approach

We believe the most efficient solution would be to include the file details directly in the message response. This could be achieved through:

1. **Population** - Joining the file data when returning messages
2. **Denormalization** - Storing the essential file fields directly in the message document when created

---

## Expected Response Format

```json
{
  "attachments": [
    {
      "fileId": "6980d88f2de85edc2e90cd19",
      "url": "https://res.cloudinary.com/...",
      "mimeType": "image/png",
      "originalName": "photo.png",
      "size": 58827
    }
  ]
}
```

---

## Additional Considerations

- The same optimization could apply to the WebSocket `chat:message` event for real-time messages
- If there are constraints we're not aware of, we're open to alternative solutions

---

## Next Steps

Would love to discuss this with you. Let us know:

1. Are there any constraints or considerations we should be aware of?
2. What approach would work best with the current architecture?
3. Rough timeline estimate?

Thanks for your help!
