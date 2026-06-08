declare module 'react-simple-maps' {
  import type { ReactNode, CSSProperties, MouseEvent } from 'react';

  interface ProjectionConfig {
    center?: [number, number];
    scale?: number;
    parallels?: [number, number];
    rotate?: [number, number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface GeoPath {
    centroid(feature: GeoFeature): [number, number];
    (feature: GeoFeature): string;
  }

  interface GeographiesRenderProps {
    geographies: GeoFeature[];
    path: GeoPath;
    projection: (coords: [number, number]) => [number, number];
  }

  interface GeoFeature {
    rsmKey: string;
    id: string;
    type: string;
    properties: Record<string, unknown>;
    geometry: unknown;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (props: GeographiesRenderProps) => ReactNode;
  }

  interface StyleSpec {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    outline?: string;
    cursor?: string;
  }

  interface GeographyProps {
    geography: GeoFeature;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: { default?: StyleSpec; hover?: StyleSpec; pressed?: StyleSpec };
    onClick?: (event: MouseEvent<SVGPathElement>) => void;
    onMouseEnter?: (event: MouseEvent<SVGPathElement>) => void;
    onMouseLeave?: (event: MouseEvent<SVGPathElement>) => void;
  }

  interface ZoomMovePosition {
    coordinates: [number, number];
    zoom: number;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    filterZoomEvent?: (event: Event) => boolean;
    onMoveStart?: (position: ZoomMovePosition, event: Event) => void;
    onMove?: (position: { x: number; y: number; zoom: number; dragging: boolean }, event: Event) => void;
    onMoveEnd?: (position: ZoomMovePosition, event: Event) => void;
    className?: string;
    children?: ReactNode;
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element;
  export function Geographies(props: GeographiesProps): JSX.Element;
  export function Geography(props: GeographyProps): JSX.Element;
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;
  export function Marker(props: { coordinates: [number, number]; children?: ReactNode }): JSX.Element;
  export function Line(props: Record<string, unknown>): JSX.Element;
  export function Graticule(props: Record<string, unknown>): JSX.Element;
  export function Sphere(props: Record<string, unknown>): JSX.Element;
}
