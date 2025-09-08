import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface Post {
    id: number;
    title: string;
    content: string | null;
}

interface Props {
    posts: Post[];
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Posts',
        href: '/posts',
    },
];

export default function Posts({ posts, flash }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingPost, setDeletingPost] = useState<Post | null>(null);

    useEffect(() => {
        if (flash.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
        }
        if (flash.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
    } = useForm({
        title: '',
        content: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (editingPost) {
            put(route('posts.update', editingPost.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingPost(null);
                },
                onError: () => {
                    setToastMessage('Failed to update post');
                    setToastType('error');
                    setShowToast(true);
                },
            });
        } else {
            post(route('posts.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
                onError: () => {
                    setToastMessage('Failed to create post');
                    setToastType('error');
                    setShowToast(true);
                },
            });
        }
    };

    const handleEdit = (post: Post) => {
        setEditingPost(post);
        setData({
            title: post.title,
            content: post.content || '',
        });
        setIsOpen(true);
    };

    const confirmDelete = () => {
        if (deletingPost) {
            destroy(route('posts.destroy', deletingPost.id), {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setDeletingPost(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {showToast && (
                    <div
                        className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white animate-in fade-in slide-in-from-top-5`}
                    >
                        {toastType === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        <span>{toastMessage}</span>
                    </div>
                )}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <p>
                            Are you sure you want to delete <b>{deletingPost?.title}</b>?
                        </p>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <div className="mb-2 flex justify-between px-4">
                    <h1 className="text-2xl font-bold">Posts</h1>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New List
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingPost ? 'Edit Post' : 'Create a New Post'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        type="text"
                                        id="title"
                                        placeholder="Title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {editingPost ? 'Update Post' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="border border-sidebar-border/70 p-2 dark:border-sidebar-border">ID</th>
                            <th className="border border-sidebar-border/70 p-2 dark:border-sidebar-border">Title</th>
                            <th className="border border-sidebar-border/70 p-2 dark:border-sidebar-border">Content</th>
                            <th className="border border-sidebar-border/70 p-2 dark:border-sidebar-border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id}>
                                <td className="border border-sidebar-border/70 p-2 dark:border-sidebar-border">{post.id}</td>
                                <td className="border border-sidebar-border/70 p-2 dark:border-sidebar-border">{post.title}</td>
                                <td className="border border-sidebar-border/70 p-2 dark:border-sidebar-border">{post.content}</td>
                                <td className="border border-sidebar-border/70 p-2 dark:border-sidebar-border">
                                    <div className="flex gap-2">
                                        <Button variant={'ghost'} size={'icon'} onClick={() => handleEdit(post)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setDeletingPost(post);
                                                setDeleteModalOpen(true);
                                            }}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
