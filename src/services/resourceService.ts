import { fetchResources, uploadResource, getResourceDownloadUrl } from '@/api/resources'

export const ResourceService = {
  getAll: async (department?: string, semester?: string) => {
    return await fetchResources(department, semester)
  },

  upload: async (
    file: File,
    meta: {
      title: string
      subject: string
      semester: string
      department: string
      uploaded_by: string
    },
  ) => {
    return await uploadResource(file, meta)
  },

  getDownloadUrl: async (filename: string) => {
    return await getResourceDownloadUrl(filename)
  },
}
