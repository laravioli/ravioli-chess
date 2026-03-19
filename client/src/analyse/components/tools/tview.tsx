//https://github.com/lichess-org/lila/blob/master/ui/analyse/src/treeView/columnView.ts
import React, { useMemo, type MouseEvent, type MouseEventHandler } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import { usePageStore } from '@/core/hooks/hooks';
import { defined } from '@/lib/common';
import { getEval } from '@/lib/eval/utils';

import classes from '@/analyse/css/tree.module.css';
import type { AnalyseStore } from '@/analyse/store/analyse';
import type { Node, Path } from '@/lib/tree/interface';
import type { Ply } from '@/lib/eval/interface';

interface Handlers {
  click: MouseEventHandler<HTMLDivElement>;
}

interface TreeOpts {
  parentPath: Path;
  isMainline: boolean;
  withIndex?: boolean;
}

export const TView: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const handlers: Handlers = useMemo(
    () => ({
      click: (e) => {
        const path = eventPath(e);
        if (path) {
          analyseStore.jump(path);
        }
      },
    }),
    [],
  );

  return <>{defined(analyseStore.node) && renderTree(analyseStore, handlers)}</>;
});

function renderTree(ctrl: AnalyseStore, handlers: Handlers) {
  const root = ctrl.tree.root;
  const blackStarts = (root.ply & 1) === 1;
  return (
    <div
      className={classes.tree}
      onClick={handlers['click']}
    >
      {blackStarts && renderIndex(root.ply, false)}
      {blackStarts && emptyMove()}
      {renderChildrenOf(ctrl, root, {
        parentPath: '',
        isMainline: true,
      })}
    </div>
  );
}

function renderChildrenOf(ctrl: AnalyseStore, node: Node, opts: TreeOpts) {
  const cs = node.children,
    main = cs[0];
  if (!main) return;

  if (opts.isMainline) {
    const isWhite = main.ply % 2 == 1;
    if (!cs[1])
      return (
        <>
          {isWhite && renderIndex(main.ply, false)}
          {renderMoveAndChildrenOf(ctrl, main, {
            parentPath: opts.parentPath,
            isMainline: true,
          })}
        </>
      );
    const mainChildren = renderChildrenOf(ctrl, main, {
      parentPath: opts.parentPath + main.id,
      isMainline: true,
    });

    const passOpts = {
      parentPath: opts.parentPath,
      isMainline: true,
    };

    return (
      <>
        {isWhite && renderIndex(main.ply, false)}
        {renderMoveOf(ctrl, main, passOpts)}
        {isWhite && emptyMove()}
        <div className={classes.interrupt}>
          {renderLines(ctrl, cs.slice(1), {
            parentPath: opts.parentPath,
            isMainline: passOpts.isMainline,
          })}
        </div>
        {isWhite && mainChildren && renderIndex(main.ply, false)}
        {isWhite && mainChildren && emptyMove()}
        {mainChildren}
      </>
    );
  }
  if (!cs[1]) return renderMoveAndChildrenOf(ctrl, main, opts);
  return renderLines(ctrl, cs, opts);
}

function renderLines(ctrl: AnalyseStore, nodes: Node[], opts: TreeOpts) {
  return (
    <div className={clsx(classes.lines, !nodes[1] && classes.single)}>
      {nodes.map((n) => (
        <React.Fragment key={n.id}>
          <div className={classes.line}>
            <div className={classes.branch} />
            {renderMoveAndChildrenOf(ctrl, n, {
              parentPath: opts.parentPath,
              isMainline: false,
              withIndex: true,
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function eventPath(e: MouseEvent<HTMLDivElement>) {
  const target = e.target as HTMLElement;
  return target.dataset.p || target.parentElement?.dataset.p;
}

const plyToTurn = (ply: Ply) => Math.floor((ply - 1) / 2) + 1;

const renderIndexText = (ply: Ply, withDots: boolean) =>
  plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? '.' : '...') : '');

const renderIndex = (ply: Ply, withDots: boolean) => (
  <span className={classes.index}>{renderIndexText(ply, withDots)}</span>
);

function renderMove(node: Node) {
  const ev = node.ceval;
  return (
    <>
      <span>{node.san}</span>
      {ev && <span className={classes.eval}>{getEval(ev)}</span>}
    </>
  );
}

function renderMoveOf(ctrl: AnalyseStore, node: Node, opts: TreeOpts) {
  return opts.isMainline
    ? renderMainlineMoveOf(ctrl, node, opts)
    : renderVariationMoveOf(ctrl, node, opts);
}

function renderMainlineMoveOf(ctrl: AnalyseStore, node: Node, opts: TreeOpts) {
  const path = opts.parentPath + node.id;
  return (
    <div
      className={moveClasses(path, ctrl.path)}
      data-p={path}
    >
      {renderMove(node)}
    </div>
  );
}

function renderVariationMoveOf(ctrl: AnalyseStore, node: Node, opts: TreeOpts) {
  const withIndex = opts.withIndex || node.ply % 2 === 1,
    path = opts.parentPath + node.id;

  return (
    <div
      className={moveClasses(path, ctrl.path)}
      data-p={path}
    >
      {withIndex && renderIndex(node.ply, true)}
      {node.san}
    </div>
  );
}

function emptyMove() {
  return <div className={clsx([classes.move, classes.empty])}>...</div>;
}

function renderMoveAndChildrenOf(ctrl: AnalyseStore, node: Node, opts: TreeOpts) {
  const path = opts.parentPath + node.id;
  return (
    <>
      {renderMoveOf(ctrl, node, opts)}
      {renderChildrenOf(ctrl, node, {
        parentPath: path,
        isMainline: opts.isMainline,
      })}
    </>
  );
}

function moveClasses(path: Path, currentPath: Path) {
  const cls = [classes.move];
  if (currentPath === path) cls.push(classes.active);
  return clsx(cls);
}
