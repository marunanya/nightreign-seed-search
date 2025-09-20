import Fuse from "fuse.js"
import { Search } from "lucide-react"
import { useState } from "react"

export default function PinDialog({ itemTable, onSelect }: { itemTable: string[][], onSelect?: (item: string) => any }) {
    const [searchText, setSearchText] = useState("")

    const matchedItemTable = searchText.length == 0 ? itemTable : itemTable.map(items => new Fuse(items).search(searchText).map(fr => fr.item))

    const cols = matchedItemTable.map((items, index1) => (
        items.length > 0 ? <div key={index1} className="flex flex-col w-64 md:h-full md:overflow-y-auto scrollbar-hide px-1 pt-2 md:border-l-2 border-gray-200 dark:border-gray-800">
            {items.map((item, index2) => (
                <div key={index2} onClick={() => { if (onSelect) onSelect(item) }} className="w-full p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 active:bg-gray-300 dark:active:bg-gray-700">
                    {item}
                </div>
            ))}
        </div> : null
    ))
    return (
        <div className="absolute w-screen h-screen left-0 top-0 flex items-center justify-center" style={{ zIndex: 50 }}>
            <div className="absolute w-full h-full bg-black opacity-25" onClick={() => onSelect ? onSelect("") : 0}></div>
            <div className="absolute select-none bg-white dark:bg-gray-900 rounded-md shadow-black dark:shadow-white shadow-md">
                <div className="flex flex-row items-center w-full px-2 py-2 space-x-2 border-b-2 border-gray-200 dark:border-gray-800">
                    <Search className="text-gray-400 p-0.5" />
                    <input className="w-full focus:outline-hidden py-0.5" placeholder="Search" onChange={(e) => setSearchText(e.currentTarget.value)} />
                </div>
                <div className="pb-2">
                    <div className="flex flex-col md:flex-row h-80 overflow-y-auto md:overflow-clip scrollbar-hide">
                        {cols}
                    </div>
                </div>
            </div>
        </div>
    )
}