import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImagePlus, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Field, Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ImageUploadField } from '../../components/forms/ImageUploadField';

export default function CmsPage() {
  const { content, loading, setContent, refreshContent } = useSiteContent();
  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const { register, handleSubmit, formState, watch, setValue, getValues } = useForm({
    values: {
      gymName: content?.gymName || '',
      logo: content?.logo || '',
      aboutSection: content?.aboutSection || '',
      heroBanners: (content?.heroBanners || []).join('\n'),
      galleryImages: (content?.galleryImages || []).join('\n'),
      phone: content?.contactInformation?.phone || '',
      email: content?.contactInformation?.email || '',
      address: content?.contactInformation?.address || '',
      facebook: content?.socialLinks?.facebook || '',
      instagram: content?.socialLinks?.instagram || '',
    },
  });
  const logo = watch('logo');

  const submit = async (values) => {
    const updatedContent = await adminApi.updateContent({
      gymName: values.gymName,
      logo: values.logo,
      aboutSection: values.aboutSection,
      heroBanners: lines(values.heroBanners),
      galleryImages: lines(values.galleryImages),
      contactInformation: { phone: values.phone, email: values.email, address: values.address },
      socialLinks: { facebook: values.facebook, instagram: values.instagram },
    });
    setContent(updatedContent);
    refreshContent();
  };

  const appendUploadedImages = async (files, fieldName, setUploading) => {
    if (!files?.length) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const result = await adminApi.uploadImage(file);
        uploadedUrls.push(result.url);
      }

      const currentLines = lines(getValues(fieldName));
      setValue(fieldName, [...currentLines, ...uploadedUrls].join('\n'), { shouldDirty: true });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Website CMS" eyebrow="Public content">
        Updates the database-backed content served by `GET /cms/content`.
      </PageHeader>
      <Card>
        {loading ? <p className="text-sm text-steel">Loading website content...</p> : (
          <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
            <Field label="Gym name"><Input {...register('gymName')} /></Field>
            <ImageUploadField
              label="Logo"
              value={logo}
              onChange={(url) => setValue('logo', url, { shouldDirty: true })}
            />
            <div className="md:col-span-2"><Field label="About section"><Textarea {...register('aboutSection')} /></Field></div>
            <Field label="Phone"><Input {...register('phone')} /></Field>
            <Field label="Email"><Input type="email" {...register('email')} /></Field>
            <Field label="Address"><Input {...register('address')} /></Field>
            <Field label="Facebook"><Input {...register('facebook')} /></Field>
            <Field label="Instagram"><Input {...register('instagram')} /></Field>
            <div className="md:col-span-2">
              <Field label="Hero banners, one URL per line">
                <div className="grid gap-3">
                  <Textarea {...register('heroBanners')} />
                  <div>
                    <Button type="button" variant="subtle" onClick={() => heroInputRef.current?.click()} disabled={heroUploading}>
                      {heroUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {heroUploading ? 'Uploading...' : 'Upload hero images'}
                    </Button>
                    <input
                      ref={heroInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(event) => appendUploadedImages(Array.from(event.target.files || []), 'heroBanners', setHeroUploading)}
                    />
                  </div>
                </div>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Gallery images, one URL per line">
                <div className="grid gap-3">
                  <Textarea {...register('galleryImages')} />
                  <div>
                    <Button type="button" variant="subtle" onClick={() => galleryInputRef.current?.click()} disabled={galleryUploading}>
                      {galleryUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {galleryUploading ? 'Uploading...' : 'Upload gallery images'}
                    </Button>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(event) => appendUploadedImages(Array.from(event.target.files || []), 'galleryImages', setGalleryUploading)}
                    />
                  </div>
                </div>
              </Field>
            </div>
            <div className="md:col-span-2 flex justify-end"><Button type="submit" variant="accent" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Saving...' : 'Save website content'}</Button></div>
          </form>
        )}
      </Card>
    </div>
  );
}

function lines(value) {
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}
