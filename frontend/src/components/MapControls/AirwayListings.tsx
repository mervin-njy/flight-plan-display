import type { Airway } from "../../types/Airway";

interface Props {
  airways: Airway[];
  onHover: (airwayId: string | null) => void;
}

export default function AirwayListings({ airways, onHover }: Props) {
  return (
    <div>
      <h3 className="font-semibold mb-1">Airways</h3>
      <ul className="menu rounded-box max-h-40 overflow-y-auto">
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
