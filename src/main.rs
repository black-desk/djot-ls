use jotdown;
use std::fmt::Write;

#[must_use]
pub fn jotdown_parse(djot: &str) -> String {
    let mut out = String::new();
    for (e, sp) in jotdown::Parser::new(djot).into_offset_iter() {
        write!(out, "{:?}", e).unwrap();
        write!(out, " {:?} {:?}", &djot[sp.clone()], sp).unwrap();
        writeln!(out).unwrap();
    }
    out
}

fn main() {
    println!("{}", jotdown_parse("Hello, *world*!"));
}
