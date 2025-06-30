import { StoreItem, StoreItemCollection, StoreItemPayload } from "../../shared/Payloads/StoreItemPayload";

export function setupItems(itemDict: TSDictionary<uint32, TSDictionary<uint32, StoreItem>>) {
    let items = retrieveItems();
    items.AllItems.forEach((collection, i) => {
        let collDict = CreateDictionary<uint32, StoreItem>({});
        collection.Items.forEach((item, j) => {
            collDict.set(j, item);
        });

        itemDict.set(i, collDict);
    });
    return items;
}

function retrieveItems() {
    const payload = new StoreItemPayload();
    const filteredItems: TSArray<StoreItemCollection> = [];
    const catItemsDict = CreateDictionary<number, TSArray<StoreItem>>({})
    const data = QueryWorld("SELECT * FROM store_items;");
    while (data.GetRow()) {
        const item = new StoreItem();
        item.ID = data.GetUInt64(0);
        item.Flags = data.GetUInt64(1);
        item.Cost = data.GetUInt64(2);
        item.Name = data.GetString(3);
        item.Description = data.GetString(4);
        item.Category = data.GetDouble(5);
        item.PurchaseID = data.GetUInt64(6);
        item.ExtraID = data.GetUInt64(7);

        if (!catItemsDict.keys().includes(item.Category)) {
            catItemsDict.set(item.Category, <TSArray<StoreItem>>[]);
        }
        catItemsDict[item.Category].push(item);
    }

    catItemsDict.forEach((category, itemArray) => {
        const listToAdd = new StoreItemCollection();
        listToAdd.MaxItems = itemArray.length;
        listToAdd.Items = itemArray;
        filteredItems.push(listToAdd);
    });
    payload.MaxTabs = filteredItems.length;
    payload.AllItems = filteredItems;

    return payload;
}