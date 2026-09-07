// Deklarasi tipe longgar untuk A-Frame agar TypeScript tidak mengeluh.
declare module "aframe";

interface Window {
  AFRAME: any;
  __pengendali?: any;
}
