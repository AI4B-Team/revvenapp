
# Plan: Add Reference Image Button to Motion-Sync Mode

## Overview
Add a dedicated "Reference Image" button to the Motion-Sync mode controls in the Create page video section. This will provide a more intuitive way to upload/select reference images for motion sync generation, matching the control icons already defined in `PromptInput.tsx`.

## Current State
The Motion-Sync mode currently has these controls:
- Kling Motion (model button)
- Reference Video (video upload popover)
- Character (character selection button)
- Character Orientation (image/video toggle)
- Resolution (720p/1080p toggle)

The character image from the Character modal is used as the reference image (`input_urls`) for the KIE.AI API.

## Proposed Changes

### 1. Add Motion-Sync Reference Image State
**File:** `src/components/dashboard/GenerationInput.tsx`

Add new state variables for Motion-Sync reference image:
```typescript
// Near line 394-397 where other Motion-Sync state is defined
const [motionSyncRefImage, setMotionSyncRefImage] = useState<{ url: string; name: string; id?: string } | null>(null);
const [isUploadingMotionSyncRefImage, setIsUploadingMotionSyncRefImage] = useState(false);
```

### 2. Add Reference Image Upload Handler
**File:** `src/components/dashboard/GenerationInput.tsx`

Create a handler function for uploading reference images:
```typescript
const handleMotionSyncRefImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  // Validate file type (jpg, jpeg, png)
  // Validate file size (max 10MB)
  // Upload to storage
  // Set motionSyncRefImage state
};
```

### 3. Add Reference Image Button UI
**File:** `src/components/dashboard/GenerationInput.tsx`

Insert a new Popover button after the "Kling Motion" model button and before the "Reference Video" button in the Motion-Sync controls section (around line 6544):

```tsx
{/* Reference Image for Motion-Sync */}
<Popover>
  <Tooltip>
    <TooltipTrigger asChild>
      <PopoverTrigger asChild>
        <button className="...">
          <ImageIcon size={16} />
          {motionSyncRefImage && <span>Ref</span>}
        </button>
      </PopoverTrigger>
    </TooltipTrigger>
    <TooltipContent>Reference Image</TooltipContent>
  </Tooltip>
  <PopoverContent>
    {/* Current selection display */}
    {/* Upload new section */}
    {/* Saved reference images section */}
  </PopoverContent>
</Popover>
```

### 4. Update Generation Logic
**File:** `src/components/dashboard/GenerationInput.tsx`

Modify the Motion-Sync generation logic (around line 2990-3070) to prioritize the reference image:
- Use `motionSyncRefImage.url` if available
- Fall back to character image if no separate reference image is provided
- Allow generation with either reference image OR character image

### 5. Clear State After Generation
Add cleanup for the new reference image state after successful generation (around line 3067).

## Technical Details

### File Validation Requirements (per KIE.AI API)
- Accepted formats: JPG, JPEG, PNG
- Max file size: 10MB
- Minimum dimensions: >300px in both width and height
- Aspect ratio: 2:5 to 5:2

### UI Behavior
- Button shows "Ref" label when an image is selected
- Popover displays current selection with remove option
- Upload section with drag/drop or click-to-upload
- Grid of saved reference images from user's history

### Storage Path
Upload to: `reference-images/{user_id}/{timestamp}_{filename}`

## Files to Modify
1. `src/components/dashboard/GenerationInput.tsx`
   - Add state variables for reference image
   - Add upload handler function
   - Add Reference Image Popover UI in Motion-Sync section
   - Update generation logic to use reference image
   - Clear reference image state after generation

## Visual Layout
The Motion-Sync controls will become:
```
[Kling Motion] [Ref Image] [Ref Video] [Character] [Orientation] [Resolution]
```
