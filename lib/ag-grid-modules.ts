import { ModuleRegistry } from 'ag-grid-community'
import {
    ClientSideRowModelModule,
    ValidationModule,
    GridApi,
    ColDef,
    GridOptions,
    GridReadyEvent,
    RowClickedEvent,
    ICellRendererParams,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    ColumnAutoSizeModule,
    RowSelectionModule,
    CellStyleModule,
    PaginationModule,
} from 'ag-grid-community'

// Register all required modules globally
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    RowSelectionModule,
    CellStyleModule,
    DateFilterModule,
    PaginationModule,
    ColumnAutoSizeModule,
    // Add ValidationModule for development to help with debugging
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : [])
])

export type {
    GridApi,
    ColDef,
    GridOptions,
    GridReadyEvent,
    RowClickedEvent,
    ICellRendererParams
} 