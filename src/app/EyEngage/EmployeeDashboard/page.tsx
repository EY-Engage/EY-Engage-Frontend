"use client";
import Link from "next/link";
import { CalendarIcon, ChatBubbleLeftEllipsisIcon, UsersIcon, RocketLaunchIcon } from "@heroicons/react/24/solid";

export default function FrontOffice() {
  const features = [
    {
      title: "Événements",
      description: "Découvrez les prochains rendez-vous EY",
      icon: <CalendarIcon className="w-10 h-10 text-white" />,
      link: "/front-office/events",
      color: "bg-ey-yellow text-ey-black",
    },
    {
      title: "Réseau Social",
      description: "Connectez-vous avec vos collègues",
      icon: <UsersIcon className="w-10 h-10 text-white" />,
      link: "/front-office/social",
      color: "bg-ey-black text-ey-white",
    },
    {
      title: "Carrière",
      description: "Développez votre parcours professionnel",
      icon: <RocketLaunchIcon className="w-10 h-10 text-white" />,
      link: "/front-office/career",
      color: "bg-ey-black text-ey-white",
    },
  ];

  return (
    <section className="py-20 bg-ey-lightGray">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6 text-ey-black">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-ey-yellow to-ey-black">
            EY Engage
          </span>
        </h1>
        <p className="text-xl text-ey-black mb-12 max-w-2xl mx-auto">
          Votre hub collaboratif pour une expérience employé exceptionnelle
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link href={feature.link} key={index}>
              <div
                className={`rounded-xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 ${feature.color}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-base">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-ey-black">Tendances du moment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ajouter ici les composants de tendances */}
          </div>
        </div>
      </div>
    </section>
  );
}
