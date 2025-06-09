import type { Airway } from "../../types/Airway";

interface Props {
  airways: Airway[];
  onHover: (airwayId: string | null) => void;
}

export default function AirwayListings({ airways, onHover }: Props) {
  return (
    <div className="bg-base-100 mb-5">
      <h3 className="font-semibold">Airways</h3>
      <ul className="menu rounded-box max-h-20 md:max-h-28 overflow-y-auto">
        {airways.map((aw) => (
          <li key={aw.id}>
            <a
              className="text-grey-200 hover:text-pink-100"
              onMouseEnter={() => onHover(aw.id)}
              onMouseLeave={() => onHover(null)}
            >
              {aw.id}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
