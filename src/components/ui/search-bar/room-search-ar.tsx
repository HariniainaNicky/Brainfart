"use client"
import { Input } from "../shadcn-component/input"
import { Button } from "../shadcn-component/button"

type RoomSearchBarProps = {
  setSearchedRooms: React.Dispatch<React.SetStateAction<string>>
  searchedRooms: string
}

export const RoomSearchBar = ({ searchedRooms, setSearchedRooms }: RoomSearchBarProps) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search for a game..."
        value={searchedRooms}
        onChange={(e) => setSearchedRooms(e.target.value)}
      />
      {searchedRooms && (
        <Button variant="outline" onClick={() => setSearchedRooms("")}>
          Clear
        </Button>
      )}
    </div>
  )
}
