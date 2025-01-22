import React, { CSSProperties, useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReactTable, ColumnDef, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { RxHamburgerMenu } from "react-icons/rx";
import useKeyboardNavigation from './Components/useKeyboardNavigation';


const SortableItem = ({
  id,
  column,
}: {
  id: string;
  column: any;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    padding: '8px',
    margin: '4px 0',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'grab',
  };

  return (
    <div style={style}> <span ref={setNodeRef}  {...attributes} {...listeners}><RxHamburgerMenu /></span>
      <label>
        <input
          type="checkbox"
          checked={column.getIsVisible()}
          onChange={column.getToggleVisibilityHandler()}
        />
        {column.id}
      </label>
    </div>
  );
};


export default function App() {
  const [hiddenRows, setHiddenRows] = useState<number[]>([]);

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'firstName', header: 'First Name', id: 'firstName' },
      { accessorKey: 'lastName', header: 'Last Name', id: 'lastName' },
      { accessorKey: 'age', header: 'Age', id: 'age' },
      { accessorKey: 'visits', header: 'Visits', id: 'visits' },
      { accessorKey: 'status', header: 'Status', id: 'status' },
      { accessorKey: 'progress', header: 'Progress', id: 'progress' },
      { accessorKey: 'channelName', header: 'Channel Name', cell: (info) => runChannelName(info.row), id: 'channelName' },
    ],
    []
  );


  const runChannelName = (value: any) => {
    const [ChannelName, setChannelName] = useState<boolean>(false);
    const [ActiveDropDown, setActiveDrop] = useState<number | null>();

    const toggleDropdown = () => {
      setChannelName((prevChannelName) => {
        const newChannelName = !(ActiveDropDown === value.id && prevChannelName);

        // If the dropdown is being opened, set ActiveDropDown to the current value's ID.
        if (newChannelName) {
          setActiveDrop(value.id);
        } else {
          // Close the dropdown by clearing ActiveDropDown.
          setActiveDrop(null);
        }
        return newChannelName;
      });
    };

    return (
      <>
        <div
          className="relative flex justify-center"
          onClick={toggleDropdown}
        >
          A
          {ChannelName && ActiveDropDown === value.id && (
            <div
              className="absolute bg-white border rounded shadow-md"
              style={{
                top: '90%',
                left: '50%',
                transform: 'translate(-50%, 0%)',
                padding: '10px',
                zIndex: 10,
              }}
            >
              <div>A</div>
              <div>B</div>
            </div>
          )}
        </div>
      </>
    );
  }


  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const savedOrder = localStorage.getItem('columnOrder');
    return savedOrder ? JSON.parse(savedOrder) : columns.map(c => c.id!);
  });
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const savedVisibility = localStorage.getItem('columnVisibility');
    return savedVisibility ? JSON.parse(savedVisibility) : {};
  });

  // Save column order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
  }, [columnVisibility]);


  const [data] = React.useState(() => Array(20).fill(0).map(() => ({
    firstName: 'John',
    lastName: 'Doe',
    age: Math.floor(Math.random() * 50) + 20,
    visits: Math.floor(Math.random() * 100),
    status: 'Active',
    progress: Math.floor(Math.random() * 100),
  })));

  const [keyNavigation, setKeyNavigation] = useKeyboardNavigation(data?.length, data);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && keyNavigation !== null) {
        setHiddenRows((prev) => [...prev, keyNavigation]);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) { // Mouse wheel up
        setHiddenRows((prev) => prev.slice(0, -1)); // Remove the last hidden row
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [keyNavigation]);
  const isRowHidden = (index: number) => hiddenRows.includes(index);
  const table = useReactTable({
    data,
    columns,
    state: { columnOrder, columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
  });

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setColumnOrder(currentOrder => {
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over?.id as string);
        return arrayMove(currentOrder, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4">
          {/* Draggable List */}
          <div className="w-64 border border-gray-300 rounded p-2">
            <h4 className="font-semibold mb-2">Reorder & Toggle Columns</h4>
            <div className="inline-block border border-black shadow rounded w-full">
              <div className="px-1 border-b border-black">
                <label>
                  <input
                    {...{
                      type: 'checkbox',
                      checked: table.getIsAllColumnsVisible(),
                      onChange: table.getToggleAllColumnsVisibilityHandler(),
                    }}
                  />{' '}
                  Toggle All
                </label>

                <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
                  {table.getAllLeafColumns().map((column) => (
                    <SortableItem
                      key={column.id}
                      id={column.id}
                      column={column}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1">
            <table className="border-collapse border border-gray-300 w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows
                  .filter(row => !isRowHidden(row.index)) // Exclude hidden rows
                  .map(row => (
                    <tr
                      key={row.id}
                      tabIndex={row.index}
                      className={`font-medium h-7 text-center 
                        ${keyNavigation === row.index
                          ? 'bg-[#e0cfb0] text-black'
                          : 'text-white odd:bg-[#24303f] even:bg-[#2d3d52]'}`}
                      onClick={() => setKeyNavigation(row.index)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
