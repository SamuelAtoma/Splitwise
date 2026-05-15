declare module '*.css' {
  const content: string;
  export default content;
}

// Allow raw HTML/SVG elements in web-only icon/map code.
// Metro handles these at runtime; tsc alone lacks react-dom intrinsics in react-native JSX mode.
declare namespace JSX {
  interface IntrinsicElements {
    svg: any; path: any; circle: any; rect: any; line: any;
    polyline: any; polygon: any; g: any; defs: any;
    linearGradient: any; stop: any; text: any; tspan: any;
  }
}
