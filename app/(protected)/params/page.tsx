"use client"

import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Protagonist {
    id?: number;
    author_id: string;
    name: string;
    physical_description: string;
    likes: string;
    dislikes: string;
}

export default function Component() {
    const supabase = useSupabaseClient();
    const user = useUser();
    const [protagonists, setProtagonists] = useState<Protagonist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openItem, setOpenItem] = useState('protagonists');
    const [openItemB, setOpenItemB] = useState('protagonists');

    useEffect(() => {
        if (user) {
            fetchProtagonists();
        } else {
            setLoading(false);
        }
    }, [user]);

    async function fetchProtagonists() {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('protagonists')
                .select('*')
                .eq('author_id', user.id)
                .order('id', { ascending: true });

            if (error) throw error;
            setProtagonists(data || []);
        } catch (error) {
            console.error('Error fetching protagonists:', error);
            setError('No se pudieron cargar los protagonistas.');
        } finally {
            setLoading(false);
        }
    }

    async function addProtagonist() {
        if (!user) {
            setError('Debes iniciar sesión para añadir un protagonista.');
            return;
        }
        const newProtagonist: Protagonist = {
            author_id: user.id,
            name: '',
            physical_description: '',
            likes: '',
            dislikes: ''
        };
        try {
            setError(null);
            const { data, error } = await supabase
                .from('protagonists')
                .insert([newProtagonist])
                .select();

            if (error) throw error;
            if (data) setProtagonists([...protagonists, data[0]]);
        } catch (error) {
            console.error('Error adding protagonist:', error);
            setError('No se pudo añadir el protagonista.');
        }
    }

    function handleInputChange(id: number, field: keyof Protagonist, value: string) {
        setProtagonists((prevProtagonists) =>
            prevProtagonists.map((p) =>
                p.id === id ? { ...p, [field]: value } : p
            )
        );
    }

    async function handleBlur(id: number, field: keyof Protagonist, value: string) {
        if (!user) return;
        try {
            setError(null);
            const { error } = await supabase
                .from('protagonists')
                .update({ [field]: value })
                .eq('id', id)
                .eq('author_id', user.id);

            if (error) throw error;
            // Opcional: mostrar una notificación de éxito
        } catch (error) {
            console.error('Error updating protagonist:', error);
            setError('No se pudo actualizar el protagonista.');
        }
    }

    async function removeProtagonist(id: number) {
        if (!user) return;
        try {
            setError(null);
            const { error } = await supabase
                .from('protagonists')
                .delete()
                .eq('id', id)
                .eq('author_id', user.id);

            if (error) throw error;
            setProtagonists(protagonists.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error removing protagonist:', error);
            setError('No se pudo eliminar el protagonista.');
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <Alert variant="destructive" className="m-6">
                <AlertDescription>Debes iniciar sesión para ver y gestionar tus protagonistas.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-primary">Mis Parámetros</h1>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
                <AccordionItem value="protagonists">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-xl font-bold text-primary">Protagonistas</h2>
                    </AccordionTrigger>
                    <AccordionContent className={'flex flex-col gap-3'}>
                        {protagonists.map((protagonist, index) => (
                            <Card key={protagonist.id}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        {protagonist.name || 'Protagonista ' + (index + 1)}
                                        <Button variant="ghost" size="icon" onClick={() => removeProtagonist(protagonist.id!)}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <label htmlFor={`name-${protagonist.id}`} className="block text-sm font-medium text-gray-700">
                                                Nombre
                                            </label>
                                            <Input
                                                id={`name-${protagonist.id}`}
                                                value={protagonist.name}
                                                onChange={(e) =>
                                                    handleInputChange(protagonist.id!, 'name', e.target.value)
                                                }
                                                onBlur={(e) =>
                                                    handleBlur(protagonist.id!, 'name', e.target.value)
                                                }
                                                placeholder="Nombre del protagonista"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`physical-${protagonist.id}`} className="block text-sm font-medium text-gray-700">
                                                Descripción
                                            </label>
                                            <Textarea
                                                id={`physical-${protagonist.id}`}
                                                className="resize-none"
                                                value={protagonist.physical_description}
                                                onChange={(e) =>
                                                    handleInputChange(protagonist.id!, 'physical_description', e.target.value)
                                                }
                                                onBlur={(e) =>
                                                    handleBlur(protagonist.id!, 'physical_description', e.target.value)
                                                }
                                                placeholder="Describe las características físicas"
                                            />
                                        </div>
                                        <div className="flex flex-col lg:flex-row lg:space-x-4 gap-2">
                                            <div className="flex-1">
                                                <label htmlFor={`likes-${protagonist.id}`} className="block text-sm font-medium text-gray-700">
                                                    Gustos
                                                </label>
                                                <Textarea
                                                    id={`likes-${protagonist.id}`}
                                                    className="resize-none"
                                                    value={protagonist.likes}
                                                    onChange={(e) =>
                                                        handleInputChange(protagonist.id!, 'likes', e.target.value)
                                                    }
                                                    onBlur={(e) =>
                                                        handleBlur(protagonist.id!, 'likes', e.target.value)
                                                    }
                                                    placeholder="¿Qué le gusta a este protagonista?"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor={`dislikes-${protagonist.id}`} className="block text-sm font-medium text-gray-700">
                                                    Disgustos
                                                </label>
                                                <Textarea
                                                    id={`dislikes-${protagonist.id}`}
                                                    className="resize-none"
                                                    value={protagonist.dislikes}
                                                    onChange={(e) =>
                                                        handleInputChange(protagonist.id!, 'dislikes', e.target.value)
                                                    }
                                                    onBlur={(e) =>
                                                        handleBlur(protagonist.id!, 'dislikes', e.target.value)
                                                    }
                                                    placeholder="¿Qué no le gusta a este protagonista?"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Button onClick={addProtagonist} className="mt-4">
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Protagonista
                        </Button>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            {/* Resto del código */}
        </div>
    );
}
