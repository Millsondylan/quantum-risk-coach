/// <reference types="vite/client" />

declare module '@/lib/*' {
  const content: any;
  export default content;
}

declare module '@/components/*' {
  const content: any;
  export default content;
}
