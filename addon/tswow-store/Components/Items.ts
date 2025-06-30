import { BuyItemPayload } from "../../../shared/Payloads/BuyItemPayload";
import { StoreItem, StoreItemFlags } from "../../../shared/Payloads/StoreItemPayload";
import { createIcon } from "./Icon";

const itemFramesList: WoWAPI.Frame[] = [];
const basePosX = 222;
const basePosY = -60;
const visualizationSize = 90;
const spaceBetweenNodes = 155;

export function createAllItems(shopFrame: WoWAPI.Frame) {
    for (let i = 0; i < 8; i++) {
        const posX = basePosX + (i % 4) * spaceBetweenNodes;
        const posY = basePosY - Math.floor(i / 4) * (spaceBetweenNodes + visualizationSize);
        const itemFrame = CreateFrame("Frame", "Item" + i, shopFrame);
        itemFrame.SetID(i)
        itemFrame.SetSize(shopFrame.GetWidth() / 5.75, shopFrame.GetHeight() / 2.5);
        itemFrame.EnableMouse(true)
        itemFrame.SetPoint("TOPLEFT", posX, posY);
        itemFrame.Hide()

        itemFrame.SetScript("OnEnter", function () {
            itemFrame['hoverTexture'].Show();
            SetCursor("INSPECT_CURSOR");
        })

        itemFrame.SetScript("OnLeave", function () {
            itemFrame['hoverTexture'].Hide();
            SetCursor("POINT_CURSOR");
        })

        itemFrame['hoverTexture'] = itemFrame.CreateTexture("hoverTexture" + i, "OVERLAY")
        itemFrame['hoverTexture'].SetAllPoints(itemFrame)
        itemFrame['hoverTexture'].SetTexture("Interface\\AddOns\\dh-store-assets\\NewStoreMain.blp")
        itemFrame['hoverTexture'].SetTexCoord(0.349609375, 0.491046875, 0.645625000, 0.849609375)
        itemFrame['hoverTexture'].SetSize(itemFrame.GetWidth(), itemFrame.GetHeight())
        itemFrame['hoverTexture'].Hide()

        itemFrame['itemTexture'] = itemFrame.CreateTexture("itemTexture" + i, "ARTWORK");
        itemFrame['itemTexture'].SetAllPoints();
        itemFrame['itemTexture'].SetTexture("Interface\\AddOns\\dh-store-assets\\item-sale-bg.blp");
        itemFrame['itemTexture'].SetTexCoord(0.035156250, 0.601562500, 0.039062500, 0.849062500);
        itemFrame['itemTexture'].SetSize(itemFrame.GetWidth() * 1.8, itemFrame.GetHeight() * 1.3);

        itemFrame['itemString'] = itemFrame.CreateFontString("itemName" + i, "OVERLAY", "GameFontNormal");
        itemFrame['itemString'].SetFont("Fonts\\FRIZQT__.TTF", 13, "OUTLINE");
        itemFrame['itemString'].SetPoint("CENTER", 0, -20);
        itemFrame['itemString'].SetWidth(itemFrame.GetWidth() - 20)
        itemFrame['itemString'].SetWordWrap(true)

        itemFrame[`activeItemTexture`] = itemFrame.CreateTexture("itemTexture" + i, "ARTWORK");
        itemFrame['activeItemTexture'].SetAllPoints();
        itemFrame['activeItemTexture'].SetTexture("Interface\\AddOns\\dh-store-assets\\NewStoreMain.blp");
        itemFrame['activeItemTexture'].SetTexCoord(0.208984375, 0.350953125, 0.646000000, 0.850000000);
        itemFrame['activeItemTexture'].SetSize(itemFrame.GetWidth(), itemFrame.GetHeight())
        itemFrame['activeItemTexture'].Hide()

        // itemFrame['descString'] = itemFrame.CreateFontString("itemDescription" + i, "OVERLAY", "GameFontNormal");
        // itemFrame['descString'].SetFont("Fonts\\FRIZQT__.TTF", 11, "OUTLINE");
        // itemFrame['descString'].SetPoint("CENTER", 0, -20);
        // itemFrame['descString'].SetSize(itemFrame.GetWidth() - 20, 50);
        // itemFrame['descString'].SetWordWrap(true)

        itemFrame['icon'] = createIcon(itemFrame, i, { point: "TOP", offsetX: 0, offsetY: -32 }, { width: 76, height: 76 },);
        itemFrame['icon'].EnableMouse(true)
        itemFrame['icon'].SetScript("OnLeave", function () { GameTooltip.Hide(); })

        itemFrame['buyButton'] = createBuyButton(itemFrame, i);
        itemFrame['costIcon'] = createCostIcon(itemFrame['buyButton'], i);
        itemFramesList.push(itemFrame);
    }
    return itemFramesList;
}

export function updateItems(shopFrame: WoWAPI.Frame, items: TSArray<StoreItem>, currentTab: number, currentPage: number) {
    for (let i = 0; i < 8; i++) {
        const item = items[i];
        if (items[i] != null) {
            const itemFrame = itemFramesList[i];
            itemFrame['itemString'].SetText(item.Name);
            //itemFrame['descString'].SetText(item.Description);
            itemFrame['icon']['texture'].SetTexture(GetItemIcon(item.PurchaseID));
            const frameID = itemFrame.GetID() + (currentPage * 6);

            itemFrame.SetScript("OnMouseDown", function () {
                if (containsFlag(item.Flags, StoreItemFlags.isEquipment)) {
                    _G['shopCreatureModelFrame'].Hide()
                    _G['shopPlayerModelFrame'].Hide()
                    _G['shopModelFrame'].Hide()
                    _G['shopPlayerModelFrame'].SetUnit("player")
                    _G['shopPlayerModelFrame'].Show()
                    _G['shopModelFrame'].Show()
                    _G['shopPlayerModelFrame'].TryOn(`item:${item.PurchaseID}`)
                } else if (containsFlag(item.Flags, StoreItemFlags.iSCreature)) {
                    _G['shopPlayerModelFrame'].Hide()
                    _G['shopCreatureModelFrame'].Hide()
                    _G['shopModelFrame'].Hide()
                    _G['shopCreatureModelFrame'].SetCreature(item.ExtraID);
                    _G['shopCreatureModelFrame'].Show()
                    _G['shopModelFrame'].Show()
                }
            });

            itemFrame['icon'].SetScript("OnEnter", () => {
                GameTooltip.SetOwner(shopFrame, "ANCHOR_CURSOR");
                GameTooltip.SetHyperlink(`item:${item.PurchaseID}`)
                GameTooltip.Show();
            })

            itemFrame['buyButton'].SetScript("OnClick", (f, b, d) => {
                buyFrameID = frameID
                buyTabID = currentTab
                //@ts-ignore
                StaticPopup_Show("SHOW_CONFIRM_SALE")
            });

            itemFrame['costIcon']['costText'].SetText(items[i].Cost.toString());
            itemFrame.Show()
        } else {
            itemFramesList[i].Hide()
        }
    }
}

function containsFlag(value, flag) {
    return (value % (2 * flag)) >= flag
}

export function createCostIcon(parentFrame: WoWAPI.Button, index: number) {
    const coinFrame = CreateFrame("Frame", "Coin" + index, parentFrame);
    coinFrame.SetSize((parentFrame.GetWidth() * 40) / 100, parentFrame.GetHeight());
    coinFrame.SetPoint("RIGHT", -10, 0);

    const buttonIcon = createIcon(coinFrame, "Interface\\AddOns\\dh-store-assets\\coin.blp", { point: "RIGHT", offsetX: 0, offsetY: 0 }, { width: (coinFrame.GetWidth() - 28), height: (coinFrame.GetHeight() - 13 ) });
    buttonIcon.Show();

    coinFrame['costText'] = coinFrame.CreateFontString(null, "OVERLAY", "GameFontNormal");
    coinFrame['costText'].SetFont("Fonts\\FRIZQT__.TTF", 13, "OUTLINE");
    coinFrame['costText'].SetPoint("RIGHT", buttonIcon, "LEFT", -2, 0);
    coinFrame['costText'].Show();
    return coinFrame;
}


export function createBuyButton(parentFrame: WoWAPI.Frame, index: number) {
    const button = CreateFrame('Button', 'BuyItemButton' + index, parentFrame);
    button.SetPoint('BOTTOM', parentFrame, 0, 20);
    button.SetSize(parentFrame.GetWidth() * 75 / 100, parentFrame.GetHeight() * 13 / 100);
    button.EnableMouse(true);

    const buttonTexture = button.CreateTexture('buttonText' + index);
    buttonTexture.SetTexture("Interface\\AddOns\\dh-store-assets\\StoreFrame_Main.blp");
    buttonTexture.SetTexCoord(0.69287109375, 0.81689453125, 0.82958984375, 0.85205078125);
    buttonTexture.SetAllPoints();

    const highlightText = button.CreateTexture('buttonHighlight' + index);
    highlightText.SetTexture("Interface\\AddOns\\dh-store-assets\\StoreFrame_Main.blp")
    highlightText.SetTexCoord(0.69287109375, 0.81689453125, 0.82958984375, 0.85205078125);
    highlightText.SetAllPoints()
    button.SetHighlightTexture(highlightText)

    const pushedText = button.CreateTexture('buttonPushed' + index);
    pushedText.SetTexture("Interface\\AddOns\\dh-store-assets\\StoreFrame_Main.blp")
    pushedText.SetTexCoord(0.69287109375, 0.81689453125, 0.85302734375, 0.87548828125);
    pushedText.SetAllPoints()
    button.SetPushedTexture(pushedText);

    const buttonText = button.CreateFontString(null, 'OVERLAY', "GameFontNormal");
    buttonText.SetPoint('LEFT', 10, 0);
    buttonText.SetFont("Fonts\\FRIZQT__.TTF", 11, "OUTLINE");
    buttonText.SetText("Buy");

    return button;
}
let buyFrameID;
let buyTabID;
//@ts-ignore
StaticPopupDialogs["SHOW_CONFIRM_SALE"] = {
    text: "Are you sure?",
    button1: "Yes",
    button2: "No",
    OnAccept: function () {
        BuyItem(buyFrameID, buyTabID)
    },
    timeout: 0,
    whileDead: true,
    hideOnEscape: true,
}


export function BuyItem(itemIndex: number, tabIndex: number) {
    let sendingPacket = new BuyItemPayload();
    sendingPacket.ItemIndex = itemIndex;
    sendingPacket.TabIndex = tabIndex;
    sendingPacket.BuildPacket().Send();
}