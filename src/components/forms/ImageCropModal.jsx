import { useEffect, useRef, useState } from 'react';
import { Crop, X } from 'lucide-react';
import { Button } from '../ui/Button';

const OUTPUT_WIDTH = 800;
const OUTPUT_HEIGHT = 1000;

export function ImageCropModal({ file, onCancel, onApply }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext('2d');
    const baseScale = Math.max(OUTPUT_WIDTH / image.naturalWidth, OUTPUT_HEIGHT / image.naturalHeight);
    const scale = baseScale * zoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const overflowX = Math.max(0, (width - OUTPUT_WIDTH) / 2);
    const overflowY = Math.max(0, (height - OUTPUT_HEIGHT) / 2);
    const x = (OUTPUT_WIDTH - width) / 2 + (positionX / 100) * overflowX;
    const y = (OUTPUT_HEIGHT - height) / 2 + (positionY / 100) * overflowY;
    context.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    context.drawImage(image, x, y, width, height);
  }, [image, positionX, positionY, zoom]);

  if (!file) return null;

  const apply = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      onApply(new File([blob], `trainer-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Adjust trainer image">
      <div className="w-full max-w-3xl rounded-lg bg-white p-5 shadow-2xl dark:bg-[#181a20]">
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="flex items-center gap-2 text-xl font-black"><Crop className="h-5 w-5 text-ember" /> Adjust trainer image</h2><p className="mt-1 text-sm text-steel">Zoom and reposition the image inside the portrait crop.</p></div>
          <button type="button" onClick={onCancel} className="rounded-md p-2 text-steel hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close image editor"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-slate-900 shadow-inner">
            <canvas ref={canvasRef} width={OUTPUT_WIDTH} height={OUTPUT_HEIGHT} className="aspect-[4/5] h-auto w-full" />
          </div>
          <div className="space-y-5">
            <Range label="Zoom" min="1" max="3" step="0.01" value={zoom} onChange={setZoom} />
            <Range label="Horizontal position" min="-100" max="100" value={positionX} onChange={setPositionX} />
            <Range label="Vertical position" min="-100" max="100" value={positionY} onChange={setPositionY} />
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setZoom(1); setPositionX(0); setPositionY(0); }}>Reset position</Button>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="subtle" onClick={onCancel}>Cancel</Button><Button type="button" variant="accent" onClick={apply}>Apply and upload</Button></div>
      </div>
    </div>
  );
}

function Range({ label, value, onChange, ...props }) {
  return <label className="block text-sm font-semibold"><span className="mb-2 block">{label}</span><input type="range" className="w-full accent-ember" value={value} onChange={(event) => onChange(Number(event.target.value))} {...props} /></label>;
}
