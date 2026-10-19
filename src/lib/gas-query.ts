import { queryOptions } from '@tanstack/react-query';
import { getPublicGasState } from './gas.functions';
export const gasQuery = queryOptions({ queryKey: ['gas'], queryFn: () => getPublicGasState(), staleTime: 15000 });