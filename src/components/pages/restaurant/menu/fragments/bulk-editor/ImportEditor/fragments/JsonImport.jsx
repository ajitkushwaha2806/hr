import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/frontend/menu";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { Copy, Loader2, Sparkles, Check } from "lucide-react";

export function JsonImport() {
    const { restaurantId } = useRestaurant();
    const notification = useNotification();
    const queryClient = useQueryClient();

    const [jsonInput, setJsonInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const promptText = `Act as a JSON extractor. I will provide you with images or a PDF of a restaurant menu. Your task is to extract all the categories, subcategories, items, variants, and modifier groups (addons) into a strict JSON format exactly matching the schema below.

CRITICAL INSTRUCTIONS:
1. Complete Dish / Item Names: Always extract full, complete, and self-contained dish names for every item. NEVER output just a flavor, style, or descriptor word.
   - If an item is listed under a category/section (such as Pizzas, Burgers, Sandwiches, Pastas, Rolls, Wraps, Shakes, Biryanis, Momos, Breads, etc.) with only a style/flavor name (e.g. "Margherita", "Farmhouse", "Aloo Tikki", "Paneer Tikka"), you MUST combine it with the category/item type to form the complete name:
     * "Margherita" under Pizzas -> "Margherita Pizza"
     * "Farmhouse" under Pizzas -> "Farmhouse Pizza"
     * "Aloo Tikki" under Burgers -> "Aloo Tikki Burger"
     * "Paneer Tikka" under Rolls -> "Paneer Tikka Roll"
     * "Butter" under Naan/Breads -> "Butter Naan"
   - Never output just "Margherita" when it is a "Margherita Pizza".

2. Connecting Addons / Modifier Groups (IMPORTANT):
   Addons (modifier groups) can be linked at TWO LEVELS:
   a) ITEM LEVEL ("addonGroups" array directly inside item):
      - Use this for general add-ons that apply to the entire dish regardless of variant option (e.g., "Choice of Beverage", "Extra Dips", "Cutlery", "Cooking Instruction").
   b) VARIANT OPTION LEVEL ("addonGroups" array inside a specific variant option):
      - Use this for add-ons that are specific to a particular variant choice (e.g., Size-specific crusts for Regular vs Large Pizza, Cheese Burst upgrade for Large only, Portion-specific rice/breads, etc.).
   - If the menu does not explicitly define addons, generate relevant, common restaurant addons/modifiers and map them to the appropriate items and/or variant options.

3. Descriptions & Prices: Make sure you capture descriptions, base prices, variant option prices, and dietary tags accurately.
4. Output Format: Only output valid JSON without any markdown code blocks, backticks, or comments.

{
  "menus": [
    {
      "name": "Pizzas",
      "sub_category": [
        {
          "name": "Classic Veg Pizzas",
          "item": [
            {
              "name": "Margherita Pizza",
              "desc": "Classic delight with 100% real mozzarella cheese",
              "price": 199,
              "dietary_slugs": ["veg"],
              "addonGroups": ["dips_group_id"],
              "variants": [
                {
                  "property_name": "Size",
                  "options": [
                    {
                      "name": "Regular (7 inch)",
                      "price": 199,
                      "addonGroups": ["regular_crust_id"]
                    },
                    {
                      "name": "Large (12 inch)",
                      "price": 449,
                      "addonGroups": ["large_crust_id"]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "modifierGroups": {
    "dips_group_id": {
      "group": {
        "name": "Choice of Dips",
        "min": 0,
        "max": 3,
        "items": [
          {
            "item": {
              "name": "Cheesy Garlic Dip",
              "desc": "Rich creamy cheese dip with roasted garlic",
              "price": 29,
              "dietary_slugs": ["veg"]
            }
          },
          {
            "item": {
              "name": "Spicy Peri Peri Dip",
              "desc": "Tangy and spicy dip",
              "price": 29,
              "dietary_slugs": ["veg"]
            }
          }
        ]
      }
    },
    "regular_crust_id": {
      "group": {
        "name": "Choice of Crust (Regular)",
        "min": 1,
        "max": 1,
        "items": [
          {
            "item": {
              "name": "New Hand Tossed",
              "price": 0,
              "dietary_slugs": ["veg"]
            }
          },
          {
            "item": {
              "name": "Cheese Burst (Regular)",
              "price": 75,
              "dietary_slugs": ["veg"]
            }
          }
        ]
      }
    },
    "large_crust_id": {
      "group": {
        "name": "Choice of Crust (Large)",
        "min": 1,
        "max": 1,
        "items": [
          {
            "item": {
              "name": "New Hand Tossed",
              "price": 0,
              "dietary_slugs": ["veg"]
            }
          },
          {
            "item": {
              "name": "Cheese Burst (Large)",
              "price": 149,
              "dietary_slugs": ["veg"]
            }
          }
        ]
      }
    }
  }
}`;

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        notification.success("Prompt copied to clipboard!");
    };

    const handleImport = async (e) => {
        e.preventDefault();
        
        let parsedData;
        try {
            parsedData = JSON.parse(jsonInput);
        } catch (err) {
            notification.error("Invalid JSON format. Please ensure you pasted correctly.");
            return;
        }

        setIsLoading(true);
        try {
            const data = await MenuService.importJson(restaurantId, parsedData);
            if (data.success) {
                const parts = [];
                if (data.stats?.categoriesImported) parts.push(`${data.stats.categoriesImported} categories`);
                if (data.stats?.itemsImported) parts.push(`${data.stats.itemsImported} items`);
                if (data.stats?.addonGroupsImported) parts.push(`${data.stats.addonGroupsImported} addons`);
                
                const msg = parts.length > 0 ? parts.join(', ') : 'menu data';
                notification.success(`Successfully imported ${msg}!`);
                
                setJsonInput("");
                queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
                queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
                queryClient.invalidateQueries({ queryKey: ["addon-groups", restaurantId] });
            } else {
                notification.error(data.message || "Failed to import JSON menu");
            }
        } catch (e) {
            notification.error(e.response?.data?.message || e.message || "Failed to import JSON menu");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full p-2 overflow-y-auto">
            <div className="w-full bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-slate-900">AI JSON Import</h4>
                        <p className="text-[14px] text-slate-500 mt-1">
                            Use Gemini or ChatGPT to extract your menu from an image or PDF.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                            <span className="font-semibold text-slate-700 text-sm">Step 1: Copy AI Prompt</span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleCopyPrompt}
                                className="h-8 gap-2 bg-white text-slate-700"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied" : "Copy Prompt"}
                            </Button>
                        </div>
                        <div className="p-4 text-xs font-mono text-slate-600 whitespace-pre-wrap overflow-y-auto max-h-[400px]">
                            {promptText}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="mb-2">
                            <span className="font-semibold text-slate-700 text-sm">Step 2: Paste AI Output</span>
                            <p className="text-xs text-slate-500 mt-1 mb-2">Paste the JSON code generated by the AI below.</p>
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='{"menus": [...]}'
                            className="flex-1 w-full p-4 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none min-h-[300px] mb-4"
                        />
                        <Button 
                            onClick={handleImport}
                            disabled={!jsonInput.trim() || isLoading}
                            className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[15px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {isLoading ? "Importing Menu..." : "Validate & Import"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
