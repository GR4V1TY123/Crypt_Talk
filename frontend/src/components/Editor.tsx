import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import ProblemDialog from "@/components/ProblemDialog";

type EditorProps = {
  className?: string;
  code?: string;
  handleCodeChange: (val: string) => void
  ideAccess?: string
  userId?: any
  requester?: string | null,
  problem?: object
};

export default function Editor({ className, code, handleCodeChange, ideAccess, userId, requester, problem }: EditorProps) {

  const canEdit = ideAccess === userId ? true : false

  return (
    <div
      className={`flex flex-col ${canEdit ? "bg-green-800" : "bg-red-700"} border border-black rounded-xl shadow-lg ${className}`}
    >


      <div className="px-4 py-2 flex items-center justify-between border-b rounded-t-xl border-white/10 bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-base font-medium text-slate-200">
            Active Problem:
            <ProblemDialog problem={problem} />
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="px-4 py-2 text-sm font-medium text-slate-300 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Code Editor</span>
        </div>

        <div className="flex items-center gap-3">
          {!canEdit && (
            <button
              onClick={() => {
                // emit socket / call API here
              }}
              className="text-xs px-3 py-1 rounded-lg cursor-pointer bg-green-800 text-green-100 border border-green-700 hover:bg-green-700 active:bg-green-900 transition-colors"
            >
              Request access
            </button>

          )}

          <span className="text-xs opacity-80">
            {canEdit ? "You have access" : "No access"}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          readOnly={!canEdit}
          value={code}
          height="400px"
          extensions={[javascript({ jsx: true })]}
          onChange={(value) => handleCodeChange(value)}
        />
      </div>
    </div>
  );
}
