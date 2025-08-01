import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScratchCard } from "@/components/ScratchCard";
import { toast } from "sonner";

export const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [showScratchCard, setShowScratchCard] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operator);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
  };

  const calculate = (firstValue: number, secondValue: number, operator: string): number => {
    switch (operator) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return secondValue !== 0 ? firstValue / secondValue : 0;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operator) {
      const newValue = calculate(previousValue, inputValue, operator);
      
      // Show scratch card with result
      setResult(newValue);
      setShowScratchCard(true);
      
      // Reset calculator state
      setPreviousValue(null);
      setOperator(null);
      setWaitingForNewValue(true);
      
      toast.success("Scratch to reveal your result! 🎉");
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
    setResult(null);
    setShowScratchCard(false);
    toast("Calculator cleared! ✨");
  };

  const onScratchComplete = () => {
    setDisplay(String(result));
    setShowScratchCard(false);
    toast.success("Result revealed! 🎊");
  };

  const formatDisplayValue = (value: string) => {
    // Limit display to reasonable length
    if (value.length > 12) {
      const num = parseFloat(value);
      return num.toExponential(6);
    }
    return value;
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-fun bg-clip-text text-transparent">
          Scratch & Calculate
        </h1>
        <p className="text-muted-foreground">
          Calculate, then scratch to reveal your result! ✨
        </p>
      </div>

      {/* Display */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="text-right text-4xl font-mono font-bold text-card-foreground min-h-[3rem] flex items-center justify-end overflow-hidden">
          {formatDisplayValue(display)}
        </div>
        {operator && (
          <div className="text-right text-sm text-muted-foreground mt-2">
            {previousValue} {operator} ...
          </div>
        )}
      </div>

      {/* Scratch Card Area */}
      {showScratchCard && result !== null && (
        <div className="animate-bounce-in">
          <ScratchCard
            result={result}
            onComplete={onScratchComplete}
          />
        </div>
      )}

      {/* Calculator Buttons */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1: Clear and Operators */}
        <Button
          variant="clear"
          size="calculatorWide"
          className="col-span-2"
          onClick={clearAll}
        >
          Clear
        </Button>
        <Button
          variant="operator"
          size="calculator"
          onClick={() => inputOperator("÷")}
        >
          ÷
        </Button>
        <Button
          variant="operator"
          size="calculator"
          onClick={() => inputOperator("×")}
        >
          ×
        </Button>

        {/* Row 2: Numbers 7-9 and subtract */}
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("7")}
        >
          7
        </Button>
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("8")}
        >
          8
        </Button>
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("9")}
        >
          9
        </Button>
        <Button
          variant="operator"
          size="calculator"
          onClick={() => inputOperator("-")}
        >
          -
        </Button>

        {/* Row 3: Numbers 4-6 and add */}
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("4")}
        >
          4
        </Button>
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("5")}
        >
          5
        </Button>
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("6")}
        >
          6
        </Button>
        <Button
          variant="operator"
          size="calculator"
          onClick={() => inputOperator("+")}
        >
          +
        </Button>

        {/* Row 4: Numbers 1-3 and equals */}
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("1")}
        >
          1
        </Button>
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("2")}
        >
          2
        </Button>
        <Button
          variant="number"
          size="calculator"
          onClick={() => inputNumber("3")}
        >
          3
        </Button>
        <Button
          variant="equals"
          size="calculator"
          className="row-span-2"
          onClick={performCalculation}
          disabled={!operator || !previousValue}
        >
          =
        </Button>

        {/* Row 5: Zero and decimal */}
        <Button
          variant="number"
          size="calculatorWide"
          className="col-span-2"
          onClick={() => inputNumber("0")}
        >
          0
        </Button>
        <Button
          variant="number"
          size="calculator"
          onClick={() => {
            if (display.indexOf(".") === -1) {
              setDisplay(display + ".");
            }
          }}
        >
          .
        </Button>
      </div>
    </div>
  );
};