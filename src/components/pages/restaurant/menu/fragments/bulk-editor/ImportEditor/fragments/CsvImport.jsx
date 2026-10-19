import { ArrowLeft, Upload, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CsvImport({ onBack }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleImport = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: Implement actual CSV upload
        setTimeout(() => {
            setIsLoading(false);
            alert("CSV import feature coming soon!");
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-2 flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-[18px] font-bold text-slate-800 mb-2">Upload your menu</h4>
                <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
                    Download our <a href="#" className="text-emerald-600 font-semibold hover:underline">CSV template</a>, fill in your categories, items, and prices, and upload it here.
                </p>

                <div className="w-full flex flex-col gap-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center">
                        <Upload className="w-8 h-8 text-emerald-500 mb-3" />
                        <span className="text-[14px] font-semibold text-slate-700">Click to upload CSV file</span>
                        <span className="text-[12px] text-slate-500 mt-1">or drag and drop</span>
                    </div>
                    <Button 
                        onClick={handleImport}
                        disabled={isLoading}
                        className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] w-full shadow-md shadow-emerald-500/20 transition-all"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Start Import
                    </Button>
                </div>
            </div>
        </div>
    );
}
