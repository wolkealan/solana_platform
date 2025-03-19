// src/spline.d.ts
declare namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        url: string;
        loading?: string;
        touch?: string;
        drag?: string;
      }, HTMLElement>;
    }
  }