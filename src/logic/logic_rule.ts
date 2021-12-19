import {FuzzyOutParam, FuzzySensor, InParam as InP, OutParam as OutP} from "./logic_methods";
import { Logic } from "./logic";

export class LogicRule {
  private antecedent: (number | null)[];
  private consequent: OutP;

  constructor(antecedent: (number | null)[], consequent: OutP) {
      if (antecedent.length > 7)
          throw "INCORRECT ANTECEDENT IN RULE";
      this.antecedent = antecedent;
      for (let i = 0; i < 7 - antecedent.length; i++)
        this.antecedent.push(null);
      this.consequent = consequent;
  }

  apply(inputs: FuzzySensor[]) : FuzzyOutParam | null {
      let result = 1;
      for (let i = 0; i < 7; i++) {
          if (this.antecedent[i] == null)
              continue;
          let mask = this.antecedent[i]!;
          let temp = inputs[i].values.filter(x => (x.distance & mask) != 0);
          if (temp.length == 0)
              return null;
          let max = Math.max(...temp.map(x => x.value))
          if (max < result)
              result = max;
      }
    //   console.log(result);
      return {
          param: this.consequent,
          value: result
      };
  }
}

export var LOGIC_RULES: LogicRule[] = [
    // Speed rules - obstacles
    new LogicRule([null, null, InP.Far, null, null, null, InP.TFar], OutP.Medium),
    new LogicRule([null, null, InP.Medium, null, null, InP.TFar], OutP.Medium),
    new LogicRule([null, null, InP.Close, null, null, InP.TFar], OutP.Slow),
    new LogicRule([null, null, InP.VeryClose, null, null], OutP.VerySlow),
    new LogicRule([null, null, null, null, null, null, InP.TClose], OutP.VerySlow),

    // *** Obstacles turn rules
    // If something on left -> turn right
    new LogicRule([null, InP.Medium,    InP.Medium,    InP.Far,        null], OutP.Right),
    new LogicRule([null, le(InP.Close), le(InP.Close), ge(InP.Medium), null], OutP.StrongRight),
    new LogicRule([null, InP.VeryClose, null,          ge(InP.Close),  null], OutP.StrongRight),

    // // If something on right -> turn left
    new LogicRule([null, InP.Far,        InP.Medium,    InP.Medium,    null], OutP.Left),
    new LogicRule([null, ge(InP.Medium), le(InP.Close), le(InP.Close), null], OutP.StrongLeft),
    new LogicRule([null, ge(InP.Close),  null,          InP.VeryClose, null], OutP.StrongLeft),

    // // *** Targeting
    // // Поворот срабатывает в сложных ситуация (надо ужесточить правила)
    // // If Target on left && Free ahead -> turn left
    new LogicRule([null, InP.Far, ge(InP.Far), null, ge(InP.Medium), InP.TStrongLeft],  OutP.StrongLeft),
    new LogicRule([null, InP.Far, ge(InP.Far), null, ge(InP.Medium), InP.TLeft],        OutP.Left),
    // // If Target on right && Free ahed -> turn right
    new LogicRule([ge(InP.Medium), null, ge(InP.Far), InP.Far, null, InP.TStrongRight], OutP.StrongRight),
    new LogicRule([ge(InP.Medium), null, ge(InP.Far), InP.Far, null, InP.TRight],       OutP.Right),

    // // *** Trap solution
    // // Prioritizing LEFT when obstacle on front && LEFT == RIGHT
    new LogicRule([ge(InP.Far), InP.Far,    le(InP.Medium), InP.Far,    null], OutP.StrongLeft),
    new LogicRule([ge(InP.Far), InP.Medium, ge(InP.Medium), InP.Medium, null], OutP.StrongLeft),
    new LogicRule([ge(InP.Far), InP.Close,  ge(InP.Close), InP.Close, null], OutP.StrongLeft),
    new LogicRule([ge(InP.Far), InP.VeryClose,  ge(InP.Close), InP.VeryClose, null], OutP.StrongLeft),
    new LogicRule([null, le(InP.Medium), null, le(InP.Medium), null], OutP.Slow),

    new LogicRule([le(InP.Close), InP.Far, null, null, null],          OutP.Left),
    new LogicRule([null,          null, null, InP.Far, le(InP.Close)], OutP.Right),


    // Слишком отдаляется при попытке отлипания
    //  ОТЛИП ДОЛЖЕН ЗАВИСИТЬ ОТ УГЛА ТАРГЕТА
    // Antistick rules
    new LogicRule([le(InP.Close), le(InP.Medium), ge(InP.Far), ge(InP.Far),          ge(InP.Medium), InP.TStrongRight], OutP.Right),
    // new LogicRule([le(InP.Close), le(InP.Medium), ge(InP.Far), ge(InP.Far),          ge(InP.Medium), null], OutP.Medium),
    new LogicRule([ge(InP.Medium),    ge(InP.Far),       ge(InP.Far), le(InP.Medium), le(InP.Close), InP.TLeft],  OutP.StrongLeft),
    // new LogicRule([ge(InP.Medium),    ge(InP.Far),       ge(InP.Far), le(InP.Medium), le(InP.Close), null],  OutP.Medium),
]

// Greater or equal
function ge(param: InP) : number {
    return 1024 - param
}

// Lesser or equal
function le(param: InP) : number {
    return (param << 1) - 1
}

