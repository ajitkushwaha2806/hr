export const useItemVariants = (variants, updateField, notification) => {
    const addVariantGroup = () => {
        if (variants && variants.length >= 1) {
            notification.error("Only a single variant property is allowed.", { duration: 5000 });
            return;
        }
        const newGroup = {
            property_name: "New Group",
            property_id: `temp-${crypto.randomUUID()}`,
            options: []
        };
        updateField("variants", [...variants, newGroup]);
    };

    const updateVariantGroup = (groupIndex, field, value) => {
        const newVariants = [...variants];
        newVariants[groupIndex] = { ...newVariants[groupIndex], [field]: value };
        updateField("variants", newVariants);
    };

    const deleteVariantGroup = (groupIndex) => {
        const newVariants = variants.filter((_, idx) => idx !== groupIndex);
        updateField("variants", newVariants);
    };

    const addVariantOption = (groupIndex) => {
        const newVariants = [...variants];
        const group = { ...newVariants[groupIndex] };
        group.options = [
            ...(group.options || []),
            { name: "New Option", price: 0, is_default: false, option_id: `temp-${crypto.randomUUID()}` }
        ];
        newVariants[groupIndex] = group;
        updateField("variants", newVariants);
    };

    const updateVariantOption = (groupIndex, optionIndex, field, value) => {
        const newVariants = [...variants];
        const group = { ...newVariants[groupIndex] };
        const newOptions = [...(group.options || [])];
        newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };

        group.options = newOptions;
        newVariants[groupIndex] = group;
        updateField("variants", newVariants);
    };

    const deleteVariantOption = (groupIndex, optionIndex) => {
        const newVariants = [...variants];
        const group = { ...newVariants[groupIndex] };
        group.options = (group.options || []).filter((_, idx) => idx !== optionIndex);
        newVariants[groupIndex] = group;
        updateField("variants", newVariants);
    };

    const addSuggestedVariant = (suggestion) => {
        if (variants && variants.length >= 1) {
            notification.error("Only a single variant property is allowed.", { duration: 5000 });
            return;
        }
        const newGroup = {
            property_name: suggestion.property_name,
            property_id: `temp-${crypto.randomUUID()}`,
            options: suggestion.options.map(opt => ({
                name: opt,
                price: 0,
                is_default: false,
                option_id: `temp-${crypto.randomUUID()}`
            }))
        };
        updateField("variants", [...variants, newGroup]);
    };

    const toggleOptionAddonGroup = (groupIndex, optionIndex, addonGroupId) => {
        const newVariants = [...variants];
        const group = { ...newVariants[groupIndex] };
        const newOptions = [...(group.options || [])];
        const opt = { ...newOptions[optionIndex] };
        const currentGroups = (opt.addonGroups || []).map(g => typeof g === 'object' ? g._id || g.id : String(g));
        const gIdStr = String(addonGroupId);

        if (currentGroups.includes(gIdStr)) {
            opt.addonGroups = currentGroups.filter(id => id !== gIdStr);
        } else {
            opt.addonGroups = [...currentGroups, gIdStr];
        }

        newOptions[optionIndex] = opt;
        group.options = newOptions;
        newVariants[groupIndex] = group;
        updateField("variants", newVariants);
    };

    return {
        addVariantGroup,
        updateVariantGroup,
        deleteVariantGroup,
        addVariantOption,
        updateVariantOption,
        deleteVariantOption,
        addSuggestedVariant,
        toggleOptionAddonGroup
    };
};
