import { Node, Path } from '../../types/general';

export interface OwnProps {
  selectedNode: string;
  nodesList: Node[];
  selectedPath: string;
  pathsList: Path[];
  locale: string;
  changePath: (label: string) => void;
  removeNode: (name: string) => void;
  removePath: (label: string) => void;
  changeLocale: (locale: string) => void;
  changeNode: (name: string) => void;
  addNode: (node: Node) => void;
  addPath: (path: Path) => void;
}

export type Props = OwnProps;
