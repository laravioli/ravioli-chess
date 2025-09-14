//https://github.com/lichess-org/lila/blob/master/ui/analyse/src/treeView/columnView.ts
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { usePageStore } from 'src/main/hooks/hooks';
import { defined } from 'src/lib/common';
import { getEval } from 'src/lib/eval/utils';
import clsx from 'clsx';
import classes from '../../css/tree.module.css';
import type { AnalyseStore } from 'src/analyse/store/analyse';

export const TView = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const handlers = useMemo(
    () => ({
      click: e => {
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

function renderTree(ctrl, handlers) {
  const root = ctrl.tree.root;
  const blackStarts = (root.ply & 1) === 1;
  return (
    <div className={classes.tree} onClick={handlers['click']}>
      {blackStarts && renderIndex(root.ply, false)}
      {blackStarts && emptyMove()}
      {renderChildrenOf(ctrl, root, {
        parentPath: '',
        isMainline: true,
      })}
    </div>
  );
}

function renderChildrenOf(ctrl, node, opts) {
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

function renderLines(ctrl, nodes, opts) {
  return (
    <div className={clsx(classes.lines, !nodes[1] && classes.single)}>
      {nodes.map(n => (
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

function eventPath(e) {
  return e.target.getAttribute('p') || e.target.parentElement.getAttribute('p');
}

const plyToTurn = ply => Math.floor((ply - 1) / 2) + 1;

const renderIndexText = (ply, withDots) => plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? '.' : '...') : '');

const renderIndex = (ply, withDots) => (
  <span className={classes.index}>{renderIndexText(ply, withDots)}</span>
);

function renderMove(node) {
  const ev = node.ceval;
  return (
    <>
      <span>{node.san}</span>
      {ev && <span className={classes.eval}>{getEval(ev)}</span>}
    </>
  );
}

function renderMoveOf(ctrl, node, opts) {
  return opts.isMainline ? renderMainlineMoveOf(ctrl, node, opts) : renderVariationMoveOf(ctrl, node, opts);
}

function renderMainlineMoveOf(ctrl, node, opts) {
  const path = opts.parentPath + node.id;
  return (
    <div className={moveClasses(path, ctrl.path)} p={path}>
      {renderMove(node)}
    </div>
  );
}

function renderVariationMoveOf(ctrl, node, opts) {
  const withIndex = opts.withIndex || node.ply % 2 === 1,
    path = opts.parentPath + node.id;

  return (
    <div className={moveClasses(path, ctrl.path)} p={path}>
      {withIndex && renderIndex(node.ply, true)}
      {node.san}
    </div>
  );
}

function emptyMove() {
  return <div className={clsx([classes.move, classes.empty])}>...</div>;
}

function renderMoveAndChildrenOf(ctrl, node, opts) {
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

function moveClasses(path, currentPath) {
  const cls = [classes.move];
  if (currentPath === path) cls.push(classes.active);
  return clsx(cls);
}
