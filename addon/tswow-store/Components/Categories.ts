import { createIcon } from "./Icon";

let categoryTable = [
    { name: "On Sale", icon: "interface\\icons\\inv_helmet_96", },// 0 
    { name: "Convenience", icon: "Interface\\Icons\\INV_SCROLL_12.blp", },// 1  
    { name: "Cosmetics", icon: "Interface\\AddOns\\dh-store-assets\\INV_ARMOR_EARTHENCIVILIAN_D_01_belt.blp", },// 2
    { name: "Mounts", icon: "Interface\\Icons\\INV_SCROLL_12.blp", },// 3
    { name: "Bundles", icon: "Interface\\AddOns\\dh-store-assets\\ITEM_VENARI_PARAGONCHEST_02.blp", },// 4
    { name: "Druid Forms", icon: "Interface\\AddOns\\dh-store-assets\\ABILITY_DRUID_SERENEFOCUS.blp" },// 5
    { name: "Warlock Forms", icon: "Interface\\AddOns\\dh-store-assets\\SPELL_WARLOCK_DEMONSOUL.blp" },// 6
];

let categoryButtons: { catFrame: WoWAPI.Frame; catIcon: WoWAPI.Frame, catString: WoWAPI.FontString, catButton: WoWAPI.Button, activeTexture: WoWAPI.Texture }[] = []
let boundingFrame = null;

export function updateCategories(categories: number[]) {
    boundingFrame.Show();
    categoryTable.forEach((category, i) => {
        let info = categoryButtons[i]
        if (categories.includes(i)) {
            info.catString.SetText(category.name);
            info.catString.Show();
            info.catIcon.Show()
            info.catFrame.Show();
        } else {
            info.catString.Hide();
            info.catIcon.Hide()
            info.catFrame.Hide();
        }
    });
    return categoryButtons
}

export function createCategories(parentFrame: WoWAPI.Frame) {
    boundingFrame = CreateFrame("Frame", "BoundingCategory", parentFrame);
    boundingFrame.SetSize((parentFrame.GetWidth() * 22.5) / 100, (parentFrame.GetHeight() * 90) / 100);
    boundingFrame.SetPoint("TOPLEFT", 18, -75);

    categoryTable.forEach((category, i) => {
        let categoryFrame = CreateFrame("Frame", "CategoryBG", boundingFrame);
        categoryFrame.SetSize(boundingFrame.GetWidth() - 8, (boundingFrame.GetHeight() * 12) / 150);
        categoryFrame.SetPoint("TOPLEFT", boundingFrame, 0, i * -(categoryFrame.GetHeight() + 0));

        let categoryButton = CreateFrame("Button", "Category", categoryFrame);
        categoryButton.SetSize(categoryFrame.GetWidth(), categoryFrame.GetHeight());
        categoryButton.SetPoint("CENTER", categoryFrame, 0, 0);
        categoryButton.RegisterForClicks("AnyDown")

        let text = categoryButton.CreateTexture("categoryText");
        text.SetAllPoints();
        text.SetTexture("Interface\\AddOns\\dh-store-assets\\NewStoreMainButton.blp");
        text.SetTexCoord(0.031250000, 0.711250000, 0.171875000, 0.316406250);

        let highlightText = categoryButton.CreateTexture("categoryTextHighlight");
        highlightText.SetAllPoints();
        highlightText.SetTexture("Interface\\AddOns\\dh-store-assets\\NewStoreMainButton.blp");
        highlightText.SetTexCoord(0.031250000, 0.710937500, 0.332031250, 0.476562500); 1
        categoryButton.SetHighlightTexture(highlightText);

        let categoryString = categoryButton.CreateFontString(null, "OVERLAY", "GameFontNormal");
        categoryString.SetFont("Fonts\\FRIZQT__.TTF", 12, "OUTLINE");
        categoryString.SetShadowOffset(1, -1)
        categoryString.SetPoint("CENTER", 0, 0);
        categoryString.SetText(category.name);

        let catBTNActive = categoryButton.CreateTexture(null, "OVERLAY")
        catBTNActive.SetAllPoints();
        catBTNActive.SetTexture("Interface\\AddOns\\dh-store-assets\\NewStoreMainButton.blp");
        catBTNActive.SetTexCoord(0.031250000, 0.710937500, 0.500000000, 0.640625000)
        catBTNActive.Hide();

        let icon: WoWAPI.Frame = createIcon(categoryFrame, category.icon, { point: "LEFT", offsetX: 6, offsetY: -1 }, { width: 30, height: 34 });
        categoryButtons.push({ catFrame: categoryFrame, catIcon: icon, catString: categoryString, catButton: categoryButton, activeTexture: catBTNActive });
    });
}