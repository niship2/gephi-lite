import { FC, useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { FaPlay, FaStop } from "react-icons/fa";
import { isNil } from "lodash";

import { LayoutsIcon } from "../../components/common-icons";
import { LAYOUTS } from "../../core/layouts/collection";
import { Layout } from "../../core/layouts/types";
import { useLayouts } from "../../core/layouts/useLayouts";
import { useNotifications } from "../../core/notifications";
import { BooleanInput, NumberInput } from "../../components/forms/TypedInputs";

type LayoutOption = {
  value: string;
  label: string;
  layout: Layout;
};

export const LayoutForm: FC<{
  layout: Layout;
  onCancel: () => void;
  onStart: (params: Record<string, unknown>) => void;
  onStop: () => void;
  isRunning: boolean;
}> = ({ layout, onCancel, onStart, onStop, isRunning }) => {
  const { t } = useTranslation();
  const [paramsState, setParamsState] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setParamsState(
      layout.parameters.reduce(
        (iter, param) => ({
          ...iter,
          [param.id]: !isNil(param.defaultValue) ? param.defaultValue : undefined,
        }),
        {},
      ),
    );
  }, [layout]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isRunning) onStop();
        else onStart(paramsState);
      }}
    >
      <h3 className="fs-5 mt-3">{t(`layouts.${layout.id}.title`)}</h3>
      {layout.description && <p className="text-muted small">{t(`layouts.${layout.id}.description`)}</p>}

      {layout.parameters.map((param) => {
        const id = `layouts-${layout.id}-params-${param.id}`;
        return (
          <div className="my-1" key={id}>
            {param.type === "number" && (
              <NumberInput
                id={id}
                label={t(`layouts.${layout.id}.parameters.${param.id}.title`) as string}
                description={
                  param.description
                    ? (t(`layouts.${layout.id}.parameters.${param.id}.description`) as string)
                    : undefined
                }
                value={paramsState[param.id] as number}
                disabled={isRunning}
                onChange={(v) => setParamsState((s) => ({ ...s, [param.id]: v }))}
              />
            )}
            {param.type === "boolean" && (
              <BooleanInput
                id={id}
                label={t(`layouts.${layout.id}.parameters.${param.id}.title`) as string}
                description={
                  param.description
                    ? (t(`layouts.${layout.id}.parameters.${param.id}.description`) as string)
                    : undefined
                }
                value={paramsState[param.id] as boolean}
                disabled={isRunning}
                onChange={(v) => setParamsState((s) => ({ ...s, [param.id]: v }))}
              />
            )}
          </div>
        );
      })}

      <div className="text-end mt-2">
        <button type="button" className="btn btn-secondary ms-2" onClick={() => onCancel()}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary ms-2">
          {layout.type === "sync" && <>{t("common.apply")}</>}
          {layout.type === "worker" && (
            <>
              {isRunning ? (
                <>
                  <FaStop className="me-1" />
                  {t("common.stop")}
                </>
              ) : (
                <>
                  <FaPlay className="me-1" />
                  {t("common.start")}
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export const LayoutsPanel: FC = () => {
  const { t } = useTranslation();
  const { notify } = useNotifications();
  const { isRunning, start, stop } = useLayouts();

  const options: Array<LayoutOption> = useMemo(
    () =>
      LAYOUTS.map((l) => ({
        value: l.id,
        label: t(`layouts.${l.id}.title`),
        layout: l,
      })),
    [t],
  );
  const [option, setOption] = useState<LayoutOption | null>(null);

  return (
    <div>
      <h2 className="fs-4">
        <LayoutsIcon className="me-1" /> {t("layouts.title")}
      </h2>
      <p className="text-muted small">{t("layouts.description")}</p>

      <Select<LayoutOption, false>
        options={options}
        value={option}
        onChange={(option) => {
          setOption(option);
          stop();
        }}
        placeholder={t("layouts.placeholder")}
      />

      {option?.layout && (
        <>
          <hr />
          <LayoutForm
            layout={option.layout}
            onStart={(params) => {
              start(option.layout.id, params);
              if (option.layout.type === "sync") {
                notify({
                  type: "success",
                  message: t("layouts.exec.success", {
                    layout: t(`layouts.${option.layout.id}.title`).toString(),
                  }).toString(),
                  title: t("layouts.title") as string,
                });
              } else {
                notify({
                  type: "info",
                  message: t("layouts.exec.started", {
                    layout: t(`layouts.${option.layout.id}.title`).toString(),
                  }).toString(),
                  title: t("layouts.title") as string,
                });
              }
            }}
            onStop={() => {
              stop();
              notify({
                type: "info",
                message: t("layouts.exec.stopped", {
                  layout: t(`layouts.${option.layout.id}.title`).toString(),
                }).toString(),
                title: t("layouts.title") as string,
              });
            }}
            isRunning={isRunning}
            onCancel={() => {
              stop();
              setOption(null);
            }}
          />
        </>
      )}
    </div>
  );
};