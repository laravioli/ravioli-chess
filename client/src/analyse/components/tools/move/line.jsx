import { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { usePageStore } from "src/main/hooks/hooks";
import { defined } from "src/lib/common";
import { getEval } from "src/lib/eval/utils";
import clsx from "clsx";
import classes from "./move.module.css";

export const Line = observer(() => {
  const analyseStore = usePageStore();
  const handlers = useMemo(
    () => ({
      click: (e) => {
        const path = eventPath(e);
        if (defined(path)) {
          analyseStore.jump(path);
        }
      },
    }),
    []
  );

  return <>{renderLines(analyseStore, handlers)}</>;
});

function renderLines(ctrl, handlers) {
  const root = ctrl.tree.root;
  const blackStarts = (root.ply & 1) === 1;
  return (
    <div className={classes.lines} onClick={handlers["click"]}>
      {blackStarts && renderIndex(root.ply, false)}
      {blackStarts && emptyMove()}
      {renderChildrenOf(ctrl, root, {
        parentPath: "",
        isMainline: true,
        activePath: ctrl.path,
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
            activePath: opts.activePath,
          })}
        </>
      );
  }
}

function eventPath(e) {
  return e.target.getAttribute("p") || e.target.parentElement.getAttribute("p");
}

const plyToTurn = (ply) => Math.floor((ply - 1) / 2) + 1;

const renderIndexText = (ply, withDots) =>
  plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? "." : "...") : "");

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
  return opts.isMainline
    ? renderMainlineMoveOf(ctrl, node, opts)
    : renderVariationMoveOf(ctrl, node, opts);
}

function renderMainlineMoveOf(ctrl, node, opts) {
  const path = opts.parentPath + node.id;
  return (
    <div className={moveClasses(path, opts)} p={path}>
      {renderMove(node)}
    </div>
  );
}

function renderVariationMoveOf(ctrl, node, opts) {
  const withIndex = opts.withIndex || node.ply % 2 === 1,
    path = opts.parentPath + node.id;

  return (
    <div className={moveClasses(path, opts)} p={path}>
      {withIndex && renderIndex(node.ply, true)}
      {node.san}
    </div>
  );
}

function emptyMove() {
  return <div className={classes.move}>...</div>;
}

function renderMoveAndChildrenOf(ctrl, node, opts) {
  const path = opts.parentPath + node.id;
  return (
    <>
      {renderMoveOf(ctrl, node, opts)}
      {renderChildrenOf(ctrl, node, {
        parentPath: path,
        isMainline: opts.isMainline,
        activePath: opts.activePath,
      })}
    </>
  );
}

function moveClasses(path, opts) {
  const cls = [classes.move];
  if (opts.activePath === path) cls.push(classes.active);
  return clsx(cls);
}
