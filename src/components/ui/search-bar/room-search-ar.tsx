"use client"
import { Input } from "../shadcn-component/input"
import { Button } from "../shadcn-component/button"

type RoomSearchBarProps = {
  setSearchedRooms: React.Dispatch<React.SetStateAction<string>>
  searchedRooms: string
}

export const RoomSearchBar = (props: RoomSearchBarProps) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search for a game..."
        value={props.searchedRooms}
        onChange={(e) => props.setSearchedRooms(e.target.value)}
      />
      {props.searchedRooms && (
        <Button variant="outline" onClick={() => props.setSearchedRooms("")}>
          Clear
        </Button>
      )}
    </div>
  )
}
