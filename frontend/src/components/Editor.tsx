import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

type EditorProps = {
  className?: string;
  code?: string;
  handleCodeChange?: (val: string) => void
  ideAccess?: string
  userId?: any
  requester?: string | null
};

export default function Editor({ className, code, handleCodeChange, ideAccess, userId, requester }: EditorProps) {

  const canEdit = ideAccess === userId ? true : false

  return (
    <div
      className={`flex flex-col ${canEdit? "bg-green-800": "bg-red-700"} border border-black rounded-xl shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-2 text-sm font-medium text-slate-300 border-b border-white/10">
        Code Editor
        {
          canEdit ? "You have access" : "No access"
        }
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
