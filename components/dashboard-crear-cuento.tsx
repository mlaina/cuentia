"use client";

import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Wand2, RefreshCw } from "lucide-react";
import Image from "next/image";
import styles from "@/types/styles.json"


const protagonistas = [
  { id: 1, nombre: "Niño" },
  { id: 2, nombre: "Niña" },
  { id: 3, nombre: "Hermanos" },
  { id: 4, nombre: "Familia" },
  { id: 5, nombre: "Mascota" },
];

const generos = [
  { id: 1, nombre: "Misterio" },
  { id: 2, nombre: "Fantasía" },
  { id: 3, nombre: "Ciencia ficción" },
  { id: 4, nombre: "Fábula" },
  { id: 5, nombre: "Mascota" },
  { id: 6, nombre: "Cuento de Hadas" },
  { id: 7, nombre: "Aventura" },
  { id: 8, nombre: "Animales" },
  { id: 9, nombre: "Humorístico" },
  { id: 10, nombre: "Educativo" },
  { id: 11, nombre: "Mitos y Leyendas" }
];


const rangoEdad = [
  { id: 1, rango: "3-5 años" },
  { id: 2, rango: "6-8 años" },
  { id: 3, rango: "9-12 años" },
];

const descripciones = [
  "Un viaje mágico a través de un bosque encantado",
  "Una aventura submarina con criaturas marinas parlantes",
  "El misterio de la casa abandonada al final de la calle",
  "Un viaje en el tiempo a la época de los dinosaurios",
  "La amistad entre un niño y un dragón bebé",
];

const concepts = ["dragon", "princess", "knight", "garden", "pirate_ship"]

export default function CrearCuentoPage() {
  const [descripcion, setDescripcion] = useState("");
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(null);
  const [concepto, setConcepto] = useState("");
  const [protagonistaSeleccionado, setProtagonistaSeleccionado] = useState("");
  const [generoSeleccionado, setGeneroSeleccionado] = useState("");
  const [edadSeleccionada, setEdadSeleccionada] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0)
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Añadimos estado para la imagen
  const router = useRouter();
  const [openItem, setOpenItem] = useState('');

  const generarDescripcionAleatoria = () => {
    setDescripcion(descripciones[Math.floor(Math.random() * descripciones.length)]);
  };


  const generarConceptoSecuencial = () => {
    setConcepto(concepts[currentConceptIndex]);
    setCurrentConceptIndex((currentConceptIndex + 1) % concepts.length);
  };


  useEffect(() => {
    setDescripcion(descripciones[Math.floor(Math.random() * descripciones.length)]);
    setConcepto(concepts[Math.floor(Math.random() * concepts.length)]);
  }, []);


  const handleCrearCuento = async () => {
    if (!descripcion || !estiloSeleccionado || !protagonistaSeleccionado || !edadSeleccionada) {
      setMessage({
        text: "Por favor, completa todos los campos requeridos.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" })

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: descripcion,
          style: estiloSeleccionado,
          gender: generoSeleccionado,
          protagonists: protagonistas.find((p) => p.id === parseInt(protagonistaSeleccionado))
              ?.nombre,
          ageRange: rangoEdad.find((r) => r.id === parseInt(edadSeleccionada))?.rango,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el cuento");
      }

      const data = await response.json();
      setMessage({
        text: "Tu cuento ha sido creado con éxito.",
        type: "success",
      });

      setStory(data.story.content);
      setImageUrl(data.image);
    } catch (error) {
      setMessage({
        text: "Hubo un problema al crear el cuento. Por favor, intenta de nuevo.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex h-screen">
        <main className="flex-1">
          {isLoading ? (
              <div className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-4xl font-bold text-transparent">
                  Creando Cuento<span className="dots">...</span>
                </div>
              </div>
          ) : (
              !story ?
                <div className="max-w-4xl mx-auto p-6 space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Protagonistas</h2>
                <Select onValueChange={setProtagonistaSeleccionado} value={protagonistaSeleccionado}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona los protagonistas" />
                  </SelectTrigger>
                  <SelectContent>
                    {protagonistas.map((protagonista) => (
                        <SelectItem key={protagonista.id} value={protagonista.id.toString()}>
                          {protagonista.nombre}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Género</h2>
                <Select onValueChange={setGeneroSeleccionado} value={generoSeleccionado}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona el género" />
                  </SelectTrigger>
                  <SelectContent>
                    {generos.map((protagonista) => (
                        <SelectItem key={protagonista.id} value={protagonista.id.toString()}>
                          {protagonista.nombre}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Descripción de la Idea</h2>
                  <Button
                      onClick={generarDescripcionAleatoria}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Sorpréndeme
                  </Button>
                </div>
                <Textarea
                    placeholder="Escribe una breve descripción de tu idea para el cuento..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Estilo de imágenes</h2>
                  <Button
                      onClick={generarConceptoSecuencial}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <RefreshCw/>
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {styles.filter(s => s.fav).map((estilo) => (
                      <Card
                          key={estilo.name}
                          className={`cursor-pointer transition-all ${
                              estiloSeleccionado === estilo.name ? "ring-2 ring-purple-500" : ""
                          }`}
                          onClick={() => setEstiloSeleccionado(estilo.name)}
                      >
                        <CardContent className="p-4 flex flex-col items-center">
                          <Image
                              src={'/styles/' + concepto +'/' + estilo.fileName + '.webp'}
                              alt={estilo.name}
                              width={200}
                              height={200}
                              className="rounded-md mb-2"
                          />
                          <span className="text-sm font-medium">{estilo.name}</span>
                        </CardContent>
                      </Card>
                  ))}
                </div>
                <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
                  <AccordionItem value="styles">
                    <AccordionTrigger className="text-sm text-gray-500 cursor-pointer">
                      {openItem === 'styles' ? 'Ocultar' : 'Ver más estilos'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
                        {styles.filter((s) => !s.fav).map((estilo) => (
                            <Card
                                key={estilo.name}
                                className={`cursor-pointer transition-all ${
                                    estiloSeleccionado === estilo.name ? "ring-2 ring-purple-500" : ""
                                }`}
                                onClick={() => setEstiloSeleccionado(estilo.name)}
                            >
                              <CardContent className="p-4 flex flex-col items-center">
                                <Image
                                    src={`/styles/${concepto}/${estilo.fileName}.webp`}
                                    alt={estilo.name}
                                    width={200}
                                    height={200}
                                    className="rounded-md mb-2"
                                />
                                <span className="text-sm font-medium">{estilo.name}</span>
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <Button
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white"
                  onClick={handleCrearCuento}
                  disabled={isLoading}
              >
                    Crear Cuento
              </Button>
            </div>
              :
                  <div className="max-w-6xl mx-auto p-6 space-y-4">
                    <div className={'flex gap-3'}>
                      <p className={'w-1/2'}>{story}</p>
                      {imageUrl && (
                          <div className={'flex justify-center items-center '}>
                            <Image className={'rounded-lg'} src={imageUrl} alt="Descripción de la imagen" width={500} height={300} />
                          </div>
                      )}
                    </div>
                    <Button
                        onClick={() => {
                          setStory("");
                          setImageUrl("");
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white">
                        Crear otro cuento
                    </Button>
                  </div>
          )}
        </main>
      </div>
  );
}
