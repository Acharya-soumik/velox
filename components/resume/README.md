# Resume Components

This directory contains components related to the resume module of the application.

## Directory Structure

- `resume-pdf.tsx`: PDF generation component for resumes
- `delete-dialog.tsx`: Confirmation dialog for deleting resumes
- `cover-letter-generator.tsx`: AI-powered cover letter generation component
- `template-selector.tsx`: Resume template selection component
- `questionnaire-modal.tsx`: Modal for collecting resume information
- `/templates`: Resume template components

## Usage

### Resume PDF

```tsx
import { ResumePDF } from "@/components/resume/resume-pdf";

// In your component
<ResumePDF resumeData={resumeData} template="modern" />
```

### Delete Dialog

```tsx
import { DeleteDialog } from "@/components/resume/delete-dialog";

// In your component
<DeleteDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={handleDeleteResume}
  resumeId={resumeId}
/>
```

### Cover Letter Generator

```tsx
import { CoverLetterGenerator } from "@/components/resume/cover-letter-generator";

// In your component
<CoverLetterGenerator
  resumeData={resumeData}
  jobDescription={jobDescription}
  onGenerate={handleGenerateCoverLetter}
/>
```

### Template Selector

```tsx
import { TemplateSelector } from "@/components/resume/template-selector";

// In your component
<TemplateSelector
  selectedTemplate={selectedTemplate}
  onSelectTemplate={setSelectedTemplate}
/>
```

### Questionnaire Modal

```tsx
import { QuestionnaireModal } from "@/components/resume/questionnaire-modal";

// In your component
<QuestionnaireModal
  isOpen={isQuestionnaireOpen}
  onClose={() => setIsQuestionnaireOpen(false)}
  onSubmit={handleQuestionnaireSubmit}
/>
``` 