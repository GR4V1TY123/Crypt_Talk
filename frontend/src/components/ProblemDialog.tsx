import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


type ProblemDialogProps = {
  problem: any;
};

export default function ProblemDialog({ problem }: ProblemDialogProps) {
  if (!problem) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="ml-2 cursor-pointer items-center gap-2 text-base text-white hover:text-emerald-400 transition-colors">
          <span className="underline underline-offset-4">
            {problem.title}
          </span>
          <span className="ml-2 text-xs text-slate-400">
            (details)
          </span>
        </button>
      </DialogTrigger>


      <DialogContent className="lg:min-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold">
            {problem.title}
          </DialogTitle>

          <div className="text-sm text-muted-foreground">
            <span className="mr-2">
              Difficulty: <span className="font-medium">{problem.difficulty}</span>
            </span>
            ·
            <span className="ml-2">
              Topics: {problem.topics?.join(", ")}
            </span>
          </div>
        </DialogHeader>

        {/* Full Description */}
        <section className="mt-6 space-y-3">
          <h3 className="font-semibold text-base">Problem Statement</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>
        </section>

        {/* Examples */}
        {/* Examples */}
        {problem.examples?.length > 0 && (
          <section className="mt-6 space-y-4">
            <h3 className="font-semibold text-base">Examples</h3>

            {problem.examples.map((ex: any) => (
              <div
                key={ex.example_num}
                className="rounded-xl border bg-muted/40 p-4 space-y-3"
              >
                <span className="block font-medium text-sm">
                  Example {ex.example_num}
                </span>

                {/* Example text */}
                <pre className="text-sm whitespace-pre-wrap leading-relaxed">
                  {ex.example_text}
                </pre>

                {/* Images (if any) */}
                {ex.images?.length > 0 && (
                  <div className="flex flex-col gap-3 pt-2">
                    {ex.images.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-center rounded-lg bg-black/5 p-2"
                      >
                        <img
                          src={img}
                          alt={`Example ${ex.example_num}`}
                          className="
                    max-h-64
                    object-contain
                    rounded-md
                    border
                  "
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}


        {/* Constraints */}
        {problem.constraints?.length > 0 && (
          <section className="mt-6">
            <h3 className="font-semibold text-base mb-2">Constraints</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              {problem.constraints.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Hints */}
        {/* Hints */}
        {problem.hints?.length > 0 && (
          <section className="mt-6">
            <h3 className="font-semibold text-base mb-2">Hints</h3>

            <Accordion type="single" collapsible className="space-y-2">
              {problem.hints.map((hint: string, i: number) => (
                <AccordionItem
                  key={i}
                  value={`hint-${i}`}
                  className="border rounded-lg bg-muted/30"
                >
                  <AccordionTrigger className="px-4 py-2 text-sm font-medium">
                    Hint {i + 1}
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                    <div
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: hint }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

      </DialogContent>
    </Dialog>
  );
}
