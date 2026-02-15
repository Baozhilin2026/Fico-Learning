import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bookmark, BookmarkType } from '@/types'

const STORAGE_KEY = 'fico_bookmarks'

export const useBookmarkStore = defineStore('bookmarks', () => {
  const bookmarks = ref<Bookmark[]>([])

  function loadBookmarks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        bookmarks.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
    }
  }

  function saveBookmarks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks.value))
    } catch (error) {
      console.error('Failed to save bookmarks:', error)
    }
  }

  function addBookmark(type: BookmarkType, id: string, data: any) {
    // Check if already bookmarked
    if (isBookmarked(type, id)) return

    bookmarks.value.push({
      id: `${type}-${id}`,
      type,
      data,
      createdAt: new Date().toISOString()
    })

    saveBookmarks()
  }

  function removeBookmark(type: BookmarkType, id: string) {
    const bookmarkId = `${type}-${id}`
    const index = bookmarks.value.findIndex(b => b.id === bookmarkId)

    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
    }
  }

  function isBookmarked(type: BookmarkType, id: string): boolean {
    const bookmarkId = `${type}-${id}`
    return bookmarks.value.some(b => b.id === bookmarkId)
  }

  function getBookmarksByType(type: BookmarkType): Bookmark[] {
    return bookmarks.value.filter(b => b.type === type)
  }

  function getAllBookmarks(): Bookmark[] {
    return [...bookmarks.value]
  }

  function clearBookmarks() {
    bookmarks.value = []
    saveBookmarks()
  }

  // Initialize
  loadBookmarks()

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarksByType,
    getAllBookmarks,
    clearBookmarks
  }
})
