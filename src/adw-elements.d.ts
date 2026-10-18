import type {DetailedHTMLProps, HTMLAttributes, MouseEventHandler, ReactNode} from 'react';

// @gjsify/adwaita-web custom elements used by the Blueshell demo terminal.
// React 19 checks JSX tags against React.JSX.IntrinsicElements (reached
// through react/jsx-runtime), not the legacy global JSX namespace, so the
// declarations below augment the 'react' module. The props are the subset
// the demo sets (attributes as strings, clicks as listeners). Dynamic
// behaviour (selection, close, theme) goes through element APIs and events,
// not props.
type AdwProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  children?: ReactNode;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'adw-window': AdwProps;
      'adw-toolbar-view': AdwProps;
      'adw-header-bar': AdwProps & {
        title?: string;
        subtitle?: string;
      };
      'adw-tab-view': AdwProps & {
        'no-close'?: boolean;
        autohide?: boolean;
      };
      'adw-tab-page': AdwProps & {
        title?: string;
      };
      'gtk-button': AdwProps & {
        'icon-name'?: string;
        'tooltip-text'?: string;
        label?: string;
        onClick?: MouseEventHandler<HTMLElement>;
      };
    }
  }
}
export {};
