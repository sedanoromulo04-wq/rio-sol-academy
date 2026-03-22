import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Track } from '@/stores/useAdminStore'

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  image: z.string().url('URL inválida'),
  status: z.enum(['active', 'draft']),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  initialData?: Track
  onSubmit: (data: FormData) => void
}

export function TrackDetailsForm({ initialData, onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      image: initialData?.image || 'https://img.usecurling.com/p/600/400?q=solar&color=blue',
      status: initialData?.status || 'draft',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Nome da Trilha</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-[#1F2937] border-white/10 text-white" />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="bg-[#1F2937] border-white/10 text-white min-h-[100px]"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">URL da Capa</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-[#1F2937] border-white/10 text-white" />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1F2937] border-white/10 text-white">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1F2937] border-white/10 text-white">
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#EAB308] hover:bg-[#d97706] text-[#422006] font-bold"
          >
            Salvar Detalhes
          </Button>
        </div>
      </form>
    </Form>
  )
}
