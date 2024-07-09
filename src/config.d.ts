declare module 'webpack-bundle-analyzer';
declare module '*.s[ac]ss' {
  const content: { [className: string]: string };
  export = content;
}
