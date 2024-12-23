import { blockRegistry } from '../utils/registry';

// Helper to get all blocks for a category
export function getCategoryBlocks(category: string) {
    return blockRegistry
        .filter(block => block.toolbox && block.category == category && !block.hidden)
        .map(block => block.toolbox);
}

export function getCategories() {
    return [
        {
            kind: "category",
            name: "Lua Tables",
            categorystyle: "list_category",
            contents: getCategoryBlocks("Lua Tables")
        },
        {
            kind: "category",
            name: "AO",
            categorystyle: "procedure_category",
            contents: getCategoryBlocks("AO")
        }
    ]
}