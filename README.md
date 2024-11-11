# gcs-photo-viewer

A simple web application to browse and view photos stored in Google Cloud Storage.

## Features

### Core Features

- Browse photos in Google Cloud Storage buckets
- Secure image viewing via proxy API
- Project and bucket selection
- Photo gallery with infinite scroll
- Folder navigation and breadcrumb trail

### Image Features

- Image thumbnails with lazy loading
- High-resolution image viewing
- Image metadata display including:
  - Basic file information (size, type, created/updated dates)
  - EXIF data (if available)
- Image optimization for better performance

### User Interface

- Responsive grid layout for photo gallery
- Modern, clean interface with dark/light mode support
- Intuitive folder navigation
- Settings panel for configuration
- Easy-to-use breadcrumb navigation
- Smooth loading states and transitions

## Requirements

- Node.js 18 or higher
- Google Cloud credentials with appropriate permissions:
  - Storage Object Viewer (`roles/storage.objectViewer`)
  - Storage Bucket Viewer (`roles/storage.bucketViewer`)
  - Project Viewer (`roles/viewer`)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/qlawmarq/gcs-photo-viewer.git
cd gcs-photo-viewer
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. **Initial Setup**

   - Prepare your Google Cloud credentials JSON file
   - Either upload the file or paste the JSON content
   - The application will validate your credentials

2. **Project & Bucket Selection**

   - Select a project from the available options
   - Choose a storage bucket to browse
   - Access settings anytime via the gear icon

3. **Photo Navigation**
   - Browse photos in a responsive grid layout
   - Navigate folders using the breadcrumb trail
   - Click photos to view in full size with metadata
   - Scroll to load more photos automatically

## Technologies Used

### Frontend

- Next.js
- React
- Tailwind CSS
- shadcn/ui Components
- TypeScript

### Backend

- Google Cloud Storage API
- Google Cloud Resource Manager API
- Sharp for image optimization
- Intersection Observer for infinite scroll

## Project Structure

```
gcs-photo-viewer/
├── app/
│   ├── api/
│   │   ├── buckets/
│   │   ├── image/
│   │   │   ├── thumbnail/
│   │   │   └── metadata/
│   │   ├── photos/
│   │   └── projects/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── PhotoViewer/
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoThumbnail.tsx
│   │   ├── PhotoModal.tsx
│   │   └── index.tsx
│   ├── ui/
│   ├── Breadcrumb.tsx
│   └── FileUpload.tsx
├── hooks/
│   └── useInfinitePhotos.ts
└── types/
    └── index.ts
```

## Performance Considerations

- Image optimization using Sharp
- Lazy loading for thumbnails
- Infinite scroll for pagination
- Efficient caching strategies
- Responsive image loading based on viewport

## Security

- Secure credential handling
- Proxy-based image loading
- Permission-based access control
- Server-side validation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
