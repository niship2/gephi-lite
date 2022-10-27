import { ComponentType, FC, useEffect, useState } from "react";
import cx from "classnames";
import Graph from "graphology";
import { parse } from "graphology-gexf";
import { BsX } from "react-icons/bs";
import { BiNetworkChart } from "react-icons/bi";
import { FaFilter, FaPaintBrush } from "react-icons/fa";
import { ImDatabase, ImStatsDots } from "react-icons/im";

import { Layout } from "../layout";
import { GraphDataPanel } from "./GraphDataPanel";
import { StatisticsPanel } from "./StatisticsPanel";
import { AppearancePanel } from "./AppearancePanel";
import { FiltersPanel } from "./FiltersPanel";
import { LayoutPanel } from "./LayoutPanel";
import { useWriteAtom } from "../../core/utils/atoms";
import { graphDatasetAtom } from "../../core/graph";
import { initializeGraphDataset } from "../../core/graph/utils";
import { GraphRendering } from "./GraphRendering";

type Tool = { type: "tool"; label: string; icon: ComponentType; panel: ComponentType };

const TOOLS: (Tool | { type: "space" })[] = [
  { type: "tool", label: "Graph", icon: ImDatabase, panel: GraphDataPanel },
  { type: "space" },
  { type: "tool", label: "Statistic", icon: ImStatsDots, panel: StatisticsPanel },
  { type: "space" },
  { type: "tool", label: "Appearance", icon: FaPaintBrush, panel: AppearancePanel },
  { type: "tool", label: "Filters", icon: FaFilter, panel: FiltersPanel },
  { type: "tool", label: "Layout", icon: BiNetworkChart, panel: LayoutPanel },
];

type State = { type: "idle" | "loading" | "ready" } | { type: "error"; error: Error };

export const GraphPage: FC = () => {
  const setGraphDataset = useWriteAtom(graphDatasetAtom);
  const [tool, setTool] = useState<Tool | null>(null);
  const [state, setState] = useState<State>({ type: "idle" });

  useEffect(() => {
    if (state.type === "idle") {
      // TODO:
      // Remove hardcoded graph source
      fetch("./arctic.gexf")
        .then((res) => res.text())
        .then((gexf) => parse(Graph, gexf))
        .then((graph) => {
          setGraphDataset(initializeGraphDataset(graph));
        })
        .then(() => {
          setState({ type: "ready" });
        })
        .catch((error) => {
          setState({ type: "error", error });
        });
    }
  }, [setGraphDataset, state.type]);

  return (
    <Layout>
      <div id="graph-page">
        <GraphRendering />
        <div className="toolbar d-flex flex-column border-end bg-white">
          {TOOLS.map((t, i) =>
            t.type === "space" ? (
              <br key={i} className="my-3" />
            ) : (
              <button
                key={i}
                type="button"
                className={cx("btn btn-ico text-center text-muted text-capitalize m-1", t === tool && "active")}
                onClick={() => (t === tool ? setTool(null) : setTool(t))}
              >
                <t.icon />
                <br />
                <small>{t.label}</small>
              </button>
            ),
          )}
        </div>
        {tool && (
          <div className="left-panel border-end position-relative bg-white">
            <button
              className="btn btn-icon position-absolute top-0 end-0"
              aria-label="close panel"
              onClick={() => setTool(null)}
            >
              <BsX />
            </button>
            <tool.panel />
          </div>
        )}
        <div className="filler"></div>
        {/*<div className="right-panel border-start bg-white"></div>*/}
      </div>
    </Layout>
  );
};